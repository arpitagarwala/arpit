import styles from './BgBlobs.module.css';

interface BgBlobsProps {
  color1?: string;
  color2?: string;
}

export default function BgBlobs({
  color1 = 'rgba(34,211,238,0.12)',
  color2 = 'rgba(99,102,241,0.12)',
}: BgBlobsProps) {
  return (
    <>
      <div
        className="bg-blob"
        style={{ background: color1, top: '-200px', left: '-200px' }}
      />
      <div
        className="bg-blob"
        style={{ background: color2, bottom: '-200px', right: '-200px' }}
      />
    </>
  );
}
