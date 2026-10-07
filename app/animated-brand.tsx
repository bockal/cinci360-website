import Link from "next/link";
import "./brand.css";

export default function AnimatedBrand() {
  return <Link className="brand animated-brand" href="/" aria-label="Cinci360 home">
    <span>Cinci</span><strong>360</strong>
    <span className="brand-tripod" aria-hidden="true">
      <img src="/favicon.svg" alt="" width="34" height="34" decoding="async" />
    </span>
  </Link>;
}
