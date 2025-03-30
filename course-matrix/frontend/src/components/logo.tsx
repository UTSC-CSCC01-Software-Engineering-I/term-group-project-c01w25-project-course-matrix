import { useState, useEffect } from "react";
import logoImg from "/img/course-matrix-logo.png";
import { ImagePlaceholder } from "./imagePlaceholder";

const Logo = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <div className="p-2 flex gap-2 items-center font-medium">
        <div className="relative rounded-lg w-8 h-8">
          {!imageLoaded && <ImagePlaceholder />}

          <img
            src={logoImg}
            alt="Course Matrix logo"
            className={`rounded-lg aspect-square object-cover w-8 h-8 transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="flex items-center gap-1">
          <div>Course</div>
          <div className="text-green-500">Matrix</div>
        </div>
      </div>
    </>
  );
};

export default Logo;
