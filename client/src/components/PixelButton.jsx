export default function PixelButton({ text, onClick }) {
  return (
    <button className="pixel-btn" onClick={onClick}>
      <span>{text}</span>
    </button>
  );
}
