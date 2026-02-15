type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}