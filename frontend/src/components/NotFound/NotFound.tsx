import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import robo from "../../../public/images/404NotFound.png";

const NotFound = () => {
  const pathname = usePathname();
  const [path, setPath] = useState("");

  useEffect(() => {
    setPath(pathname);
  }, [pathname]);

  return (
    <div className="w-[full] h-screen bg-[#1D1D1F] flex items-start pt-30 justify-center px-6">
      <div className="max-w-3xl w-full flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 flex flex-col items-start justify-center gap-3">
          <p className="text-white text-2xl font-bold">Kanflow</p>
          <p className="text-[#C5C5C7] text-md">
            <span className="text-white font-bold">404</span> — That’s an error.
          </p>
          <p className="text-gray-300 text-xs">
            The requested URL <span className="font-semibold text-white">&quot;{path}&quot;</span> was not found on this server.
          </p>
          <div>
            <p className="text-[#969696] text-xs">Either : </p>
            <p className="text-[#969696] text-xs"> - Workspace doesnt exists</p>
            <p className="text-[#969696] text-xs"> - You are not invited to this workspace!</p>
          </div>
          <p className="text-[#969696] text-xs">That’s all we know.</p>
        </div>
        <div className="flex-1">
          <Image src={robo} alt="not-found" className="w-full max-w-md mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
