export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // ป้องกัน </script> ในข้อมูล
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
