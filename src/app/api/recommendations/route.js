import { NextResponse } from 'next/server';
import { ClimatologyEngine } from '../../../engine/ClimatologyEngine';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { location, current, forecast } = body;

    // We still accept current and forecast for possible short-term overrides, but rely heavily on location for long-term intelligence
    if (!location) {
      return NextResponse.json({ error: 'Location string is required to build a structured report.' }, { status: 400 });
    }

    // Instantiate our unified, modular Intelligence Engine
    const engine = new ClimatologyEngine();
    
    // Generate the comprehensive region-aware, seasonal 6-month report
    const report = engine.generateReport(location, current || {});

    // Save report to DB if user is logged in
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.report.create({
        data: {
          userId: session.user.id,
          location: location,
          content: JSON.stringify(report)
        }
      });
      
      // Upsert Farm Profile with location if not exists
      await prisma.farmProfile.upsert({
        where: { userId: session.user.id },
        update: {}, // Don't overwrite existing profile data on every report
        create: {
          userId: session.user.id,
          location: location
        }
      });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json({ error: 'Failed to generate Long-Term Advisory Report' }, { status: 500 });
  }
}
