import { useState, useEffect } from "react";

interface CarouselItem {
  title: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  active: string;
  description?: string;
  darken?: boolean;
}
export default function Carousel({ items }: { items: CarouselItem[] }) {
  const [current, setCurrent] = useState(0);

  // the timer starts every time slide changes (automatically or manually)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, [current]);

  return (
    <>
      <div id="myCarousel" className="carousel slide bg-secondary">
        <ol className="carousel-indicators my-2">
          {items.map((_, i) => (
            <li
              data-target="#myCarousel"
              className={i == current ? "active" : ""}
              key={`carousel-item-btn-${i}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </ol>

        <div className="carousel-inner ">
          {items.map((item, i) => (
            <div
              className={`carousel-item ${i == current ? "active" : ""}`}
              key={`carousel-item-container-${i}`}
            >
              {item.image && (
                <img
                  className="d-block w-full"
                  alt={item.title}
                  src={`${import.meta.env.BASE_URL}/assets/carousel/${item.image}`}
                />
              )}

              {(item.description || item.buttonText) &&
                (item.darken ? (
                  <div className="carousel-caption carousel-darken">
                    <span className="block carousel-title">{item.title}</span>
                    <p className="carousel-p">{item.description}</p>
                    <a href={`${import.meta.env.BASE_URL}${item.buttonUrl}`} className="button">
                      {item.buttonText}
                    </a>
                  </div>
                ) : (
                  <div className="carousel-caption d-none d-md-block bg-dark my-4 p-2 pb-5">
                    <span className="block carousel-title">{item.title}</span>
                    <p className="carousel-p">{item.description}</p>
                    <a href={`${import.meta.env.BASE_URL}${item.buttonUrl}`} className="button bg-primary">
                      {item.buttonText}
                    </a>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
