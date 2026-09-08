"use client";

import { useState } from "react";

async function sha256(value: string) {
  const buffer = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function HashVerifier({
  canonicalJson,
  expectedHash
}: {
  canonicalJson: string;
  expectedHash: string;
}) {
  const [json, setJson] = useState(canonicalJson);
  const [currentHash, setCurrentHash] = useState(expectedHash);
  const [matches, setMatches] = useState(true);

  async function verify(nextValue = json) {
    const hash = await sha256(nextValue);
    setCurrentHash(hash);
    setMatches(hash === expectedHash);
  }

  return (
    <div className="verifier">
      <div className="verifier-heading">
        <div>
          <span className="eyebrow">Verificador</span>
          <h2>Hash do relatório</h2>
        </div>
        <span className={matches ? "hash-status ok" : "hash-status fail"}>
          {matches ? "íntegro" : "alterado"}
        </span>
      </div>
      <textarea
        value={json}
        onChange={(event) => {
          setJson(event.target.value);
          void verify(event.target.value);
        }}
      />
      <div className="hash-row">
        <span>Hash esperado</span>
        <code>{expectedHash}</code>
      </div>
      <div className="hash-row">
        <span>Hash atual</span>
        <code>{currentHash}</code>
      </div>
      <button
        className="ghost-button"
        type="button"
        onClick={() => {
          const tampered = `${json}\n`;
          setJson(tampered);
          void verify(tampered);
        }}
      >
        Simular alteração
      </button>
    </div>
  );
}
