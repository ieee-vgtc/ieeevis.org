/**
 *
 * @param param0
 */

import { useEffect, useState } from "react";
import { load_yaml } from "../utils/load_yaml";

export default function Sidebar({
  sidebar_data_path,
}: {
  sidebar_data_path: any;
}) {
  const [currentpath, setCurrentPath] = useState("");

  useEffect(() => {
    console.log(window.location.pathname, currentpath);
    setCurrentPath(window.location.pathname);
  }, []);

  const data = load_yaml(`./src/data/sidebars/${sidebar_data_path}.yml`);

  return (
    <aside className="sidebar ">
      {data.map((section: any, secIdx: number) => (
        <div key={`section-${secIdx}`} className="my-4">
          {section.heading && (
            <p className="heading-alt text-gray-500">{section.heading}</p>
          )}
          <div className="overflow-hidden md:ml-0 -ml-3">
            <div className="md:ml-0 -ml-px">
              {section.links.map((link: any, linkIdx: number) => (
                <div key={`side-link-${linkIdx}`}>
                  {link.url ? (
                    <a
                      href={import.meta.env.BASE_URL + link.url}
                      className={`sidebar__link ${currentpath == link.url && "sidebar__link--active"}`}
                    >
                      {link.text}
                    </a>
                  ) : (
                    <a
                      className="sidebar__link sidebar__link--disabled"
                      title="Content forthcoming"
                    >
                      {link.text}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </aside>
  );
}
