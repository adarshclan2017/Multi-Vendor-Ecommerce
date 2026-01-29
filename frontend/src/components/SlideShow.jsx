import { useEffect, useState } from "react";
import "./Slideshow.css";

function Slideshow() {
  const images = [
    "https://img.freepik.com/premium-psd/fashion-special-discount-offer-3d-banner-template_351527-1246.jpg?semt=ais_hybrid&w=740&q=80",
    "https://img.freepik.com/free-psd/gradient-cyber-monday-landing-page-template_23-2149690247.jpg?semt=ais_hybrid&w=740&q=80",
    "https://img.freepik.com/premium-vector/online-shopping-banners-discount-promos-loyal-customers-banners-promotional-media_101434-778.jpg"
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval); // cleanup
  }, [images.length]);

  return (
    <div className="slideshow-container">
      {images.map((img, index) => (
        <div
          className={`slide ${index === currentSlide ? "active" : ""}`}
          key={index}
        >
          <img src={img} alt={`Slide ${index + 1}`} />
        </div>
      ))}
    </div>
  );
}

export default Slideshow;
