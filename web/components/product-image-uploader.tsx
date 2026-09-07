"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { publicEnv } from "@/lib/env";

type ProductsResponse = {
  products: Array<{
    id: string;
  }>;
};

function safeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .toLowerCase();
}

export function ProductImageUploader({
  campaignId,
  initialUrl,
  productId
}: {
  campaignId: string;
  initialUrl?: string | null;
  productId?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl || "");
  const [status, setStatus] = useState(
    initialUrl ? "Imagem atual da campanha" : "Nenhuma imagem cadastrada para este produto."
  );
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setPreviewUrl(URL.createObjectURL(file));

    const env = publicEnv();
    const supabase = createSupabaseBrowserClient();

    if (!supabase || env.enableMocks) {
      setStatus("Preview local ativo. Configure Supabase e desligue mocks para enviar.");
      return;
    }

    setIsUploading(true);
    const path = `${campaignId}/${Date.now()}-${safeName(file.name)}`;
    const { error } = await supabase.storage.from(env.productImagesBucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      setStatus(`Falha no upload: ${error.message}`);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from(env.productImagesBucket).getPublicUrl(path);
    setPreviewUrl(data.publicUrl);

    try {
      const targetProductId =
        productId ||
        (await apiRequest<ProductsResponse>(`/api/products?campaignId=${encodeURIComponent(campaignId)}`))
          .products[0]?.id;

      if (targetProductId) {
        await apiRequest(`/api/products/${targetProductId}`, {
          method: "PATCH",
          body: { imageUrl: data.publicUrl }
        });
        setStatus("Imagem enviada e salva no produto da campanha.");
      } else {
        setStatus("Imagem enviada. Crie um produto para salvar a URL na campanha.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Imagem enviada, mas a URL não foi salva.");
    }

    setIsUploading(false);
  }

  return (
    <div className="upload-card">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Produto da campanha" />
      ) : (
        <div className="upload-placeholder">Sem imagem</div>
      )}
      <div>
        <strong>Foto do produto</strong>
        <p>{status}</p>
        <label className="file-button">
          {isUploading ? "Enviando..." : "Trocar imagem"}
          <input
            accept="image/png,image/jpeg,image/webp"
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
