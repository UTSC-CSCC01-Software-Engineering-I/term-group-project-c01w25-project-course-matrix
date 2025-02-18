import logoImg from "/img/logo.png";

const Logo = () => {
  return (
    <>
      <div className="p-2 flex gap-2 items-center font-medium">
        <img
          src={logoImg}
          alt="profile-img"
          className="rounded-lg aspect-square object-cover w-8"
        ></img>
        <div className="flex items-center gap-1">
          <div>Course</div>
          <div className="text-green-500">Matrix</div>
        </div>
      </div>
    </>
  );
};

export default Logo;
