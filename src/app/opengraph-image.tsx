import { ImageResponse } from "next/og";

export const alt = "Space Coffee and Matcha - Coffee That Takes You Further";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1B3D",
          color: "#FAF7F0",
        }}
      >
        <div style={{ display: "flex", fontSize: 80, fontWeight: 700 }}>
          Space Coffee and Matcha
        </div>
        <div style={{ display: "flex", fontSize: 38, color: "#E0A526", marginTop: 24 }}>
          Coffee That Takes You Further
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#EAF2DF", marginTop: 40 }}>
          Plaza Ono Sidareja, Lantai 3
        </div>
      </div>
    ),
    { ...size }
  );
}