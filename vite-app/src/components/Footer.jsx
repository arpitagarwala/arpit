export default function Footer({ colSpan }) {
  return (
    <div className={`site-footer${colSpan ? ` lg-col-span-${colSpan}` : ''}`}>
      &copy; 2026 Arpit Agarwala. Engineered with{' '}
      <span style={{ color: '#f87171' }}>&#10084;&#65039;</span>
    </div>
  );
}
