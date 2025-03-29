export const ImagePlaceholder = () => {
  const blurredImagePlaceholder =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAAxEhMf/aAAwDAQACEQMRAD8ASlWzQwxoGsuragA8nk6c+ONWNeOixw2aRm2AMbs5JAJJPk9aUpAJViJIGenZEwn/2Q==";

  return (
    <div
      className="absolute inset-0 rounded-lg bg-gray-200"
      style={{
        backgroundImage: `url(${blurredImagePlaceholder})`,
        backgroundSize: "cover",
        filter: "blur(8px)",
        transform: "scale(1.1)",
      }}
    ></div>
  );
};
