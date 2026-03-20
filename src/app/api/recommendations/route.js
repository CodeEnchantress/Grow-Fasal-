import { NextResponse } from 'next/server';
import { ClimatologyEngine } from '../../../engine/ClimatologyEngine';

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

    return NextResponse.json(report);

  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json({ error: 'Failed to generate Long-Term Advisory Report' }, { status: 500 });
  }
}
