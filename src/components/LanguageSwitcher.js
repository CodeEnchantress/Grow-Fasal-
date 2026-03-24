"use client";
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useLanguage();

  return (
    <select 
      value={lang} 
      onChange={(e) => changeLanguage(e.target.value)}
      style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', outline: 'none' }}
    >
      <option value="en" style={{ color: '#000' }}>English</option>
      <option value="hi" style={{ color: '#000' }}>हिन्दी (Hindi)</option>
      <option value="bn" style={{ color: '#000' }}>বাংলা (Bengali)</option>
      <option value="te" style={{ color: '#000' }}>తెలుగు (Telugu)</option>
      <option value="mr" style={{ color: '#000' }}>मराठी (Marathi)</option>
      <option value="ta" style={{ color: '#000' }}>தமிழ் (Tamil)</option>
      <option value="ur" style={{ color: '#000' }}>اردو (Urdu)</option>
      <option value="gu" style={{ color: '#000' }}>ગુજરાતી (Gujarati)</option>
      <option value="kn" style={{ color: '#000' }}>ಕನ್ನಡ (Kannada)</option>
      <option value="or" style={{ color: '#000' }}>ଓଡ଼ିଆ (Odia)</option>
      <option value="ml" style={{ color: '#000' }}>മലയാളം (Malayalam)</option>
      <option value="pa" style={{ color: '#000' }}>ਪੰਜਾਬੀ (Punjabi)</option>
      <option value="as" style={{ color: '#000' }}>অসমীয়া (Assamese)</option>
      <option value="mai" style={{ color: '#000' }}>मैथिली (Maithili)</option>
      <option value="sa" style={{ color: '#000' }}>संस्कृतम् (Sanskrit)</option>
      <option value="ne" style={{ color: '#000' }}>नेपाली (Nepali)</option>
      <option value="kok" style={{ color: '#000' }}>कोंकणी (Konkani)</option>
      <option value="mni" style={{ color: '#000' }}>মৈতৈ (Manipuri)</option>
      <option value="brx" style={{ color: '#000' }}>बड़ो (Bodo)</option>
      <option value="doi" style={{ color: '#000' }}>डोगरी (Dogri)</option>
      <option value="sat" style={{ color: '#000' }}>ᱥᱟᱱᱛᱟᱲᱤ (Santhali)</option>
      <option value="ks" style={{ color: '#000' }}>کٲشُر (Kashmiri)</option>
    </select>
  );
}
