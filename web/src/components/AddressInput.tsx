import { useState, type KeyboardEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isValidSolanaAddress } from "../lib/validation";

/** Big centered Solana address input with validation. Navigates to /scan/:address on submit. */
export function AddressInput() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = value.trim();
  const isValid = isValidSolanaAddress(trimmed);
  const showError = touched && trimmed.length > 0 && !isValid;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (touched) setTouched(false);
  }

  function submit() {
    setTouched(true);
    if (isValidSolanaAddress(trimmed)) {
      navigate(`/scan/${trimmed}`);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (trimmed.length > 0) setTouched(true);
            }}
            placeholder="Paste token address..."
            spellCheck={false}
            autoComplete="off"
            className={[
              "w-full bg-surface border rounded-lg px-4 py-3",
              "font-mono text-sm text-text placeholder-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/60",
              "transition-colors",
              showError
                ? "border-danger focus:ring-danger/40"
                : "border-border",
            ].join(" ")}
          />
        </div>
        <button
          onClick={submit}
          className="bg-accent hover:bg-accent-hover text-white rounded-lg px-5 py-3 font-medium transition-colors whitespace-nowrap"
        >
          Scan
        </button>
      </div>
      {showError && (
        <p className="mt-2 text-sm text-danger">
          Invalid Solana address. Addresses are 32–44 base58 characters.
        </p>
      )}
    </div>
  );
}
