import { ImageResponse } from 'next/og';

export const alt = 'Arpit Agarwala — Finance, Technology & Projects';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '70px 80px', background: 'linear-gradient(120deg,#102f39,#050e16)', color: '#e1f1ef', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', fontSize: 22, letterSpacing: 5, color: '#9ed7ca' }}>FINANCE · TECHNOLOGY · IDEAS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', fontSize: 82, fontWeight: 700, letterSpacing: -3 }}>Arpit Agarwala</div>
        <div style={{ display: 'flex', fontSize: 31, color: '#b1cbd1' }}>Useful tools. Thoughtful projects. A place to focus.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #41616c', paddingTop: 28, fontSize: 24 }}><span>arpitagarwala.com</span><span style={{ color: '#9ed7ca' }}>Kolkata, India</span></div>
    </div>,
    size,
  );
}
