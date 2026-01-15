import { Fragment } from "react/jsx-runtime";
import pkg from "../../package.json";

export default function Footer({
  footer_data,
  contact,
  pathname,
}: {
  contact: string;
  footer_data: { columns: FooterSectionType[] };
  pathname: string;
}) {
  const source_file = `src/pages${pathname}.md`;

  return (
    <footer className="footer text-white">
      {/* <!-- Edit Page / Report Issue --> */}
      <div className="py-4 border-t border-gray-500 text-gray-500 text-sm text-center">
        <div className="container">
          Problems with this webpage? Contact{" "}
          <a href={`mailto:${contact}`} className="link">
            {contact}
          </a>
          {", "}
          {/* <!-- <a href="mailto:{{ page.contact | default: site.email }}" className="link">{% if page.author_contact %}{{ page.author_contact }}{% else %}{{ page.contact | default: site.email }}{% endif %}</a>, --> */}
          <a
            href={`${pkg.repository.url}/issues/new/?title="Fix content problem on /${source_file}"`}
            target="_blank"
            className="link"
          >
            file a bug
          </a>
          , or{" "}
          <a
            href={`${pkg.repository.url}/edit/vis${pkg.year}/${source_file}`}
            target="_blank"
            className="link"
          >
            suggest a fix
          </a>
          .
        </div>
      </div>

      {/* <!-- Footer Starts --> */}
      <div className="bg-secondary">
        <div className="container py-12 md:py-16 flex flex-col md:flex-row">
          <div
            className="footer__header flex flex-col sm:flex-1 flex-initial pr-0 md:pr-10 lg:pr-16 mb-4 md:mb-0 pb-8 md:pb-0
                                md:border-r border-r-0 md:border-b-0 border-b border-dashed"
          >
            <div>
              <a href="/">
                <img
                  src={`${import.meta.env.BASE_URL}/assets/vis2026_logo_white.svg`}
                  alt="VIS 2026"
                  width="150"
                />
              </a>
              <p className="uppercase mt-6">
                The premier forum for advances in visualization and visual
                analytics
              </p>
            </div>
          </div>

          {footer_data.columns.map((column: any, colIdx: number) => (
            <div
              key={colIdx}
              className="sm:flex-1 flex-initial px-0 md:pl-10 lg:pl-16 mt-8 md:mt-0"
            >
              {column.section.map((section: any, secIdx: number) => (
                <Fragment key={secIdx}>
                  <p className="footer__heading">{section.heading}</p>
                  {section.display_style === "inline" ? (
                    <div className="relative overflow-hidden md:-ml-0 -ml-1">
                      <ul className="flex flex-row flex-wrap -ml-px">
                        {section.links.map((link: any, linkIdx: number) => (
                          <li key={linkIdx} className="footer__inline-link">
                            <a className="footer__link" href={link.url}>
                              {link.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <ul className="mb-6">
                      {section.links.map((link: any, linkIdx: number) => (
                        <li key={linkIdx}>
                          <a className="footer__link" href={link.url}>
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary py-8">
        <div className="container">
          <div className="flex mb-6">
            <a
              className="footer__logo"
              href="https://www.ieee.org"
              target="_new"
            >
              <img
                height="35"
                src={`${import.meta.env.BASE_URL}/assets/theme/ieee-logo-white.svg`}
                alt="IEEE"
              />
            </a>
            <a
              className="footer__logo"
              href="https://www.computer.org"
              target="_new"
            >
              <img
                height="35"
                src={`${import.meta.env.BASE_URL}/assets/theme/ieee-cs-logo-white.svg`}
                alt="IEEE Computer Society"
              />
            </a>
            <a className="footer__logo" href="http://vgtc.org" target="_new">
              <img
                height="35"
                src={`${import.meta.env.BASE_URL}/assets/theme/ieee-vgtc-logo-white.svg`}
                alt="IEEE Visualization and Graphics Technical Community"
              />
            </a>
          </div>

          <div className="flex flex-col lg:flex-row justify-between uppercase text-sm">
            <div>
              <span>
                &copy; {pkg.year} IEEE. Sponsored by the IEEE Computer Society
                and the Visualization and Graphics Technical Community.
              </span>
            </div>
            <div className="mt-4 lg:mt-0">
              <a
                className="footer__link"
                href="https://www.ieee.org/security-privacy.html"
                target="_new"
              >
                IEEE Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

type FooterSectionType = {
  section: [
    {
      heading: string; //"Past years archive",
      display_style: string; //"inline",
      links: FooterLinkType[];
    },
  ];
};

type FooterLinkType = {
  text: string; //"2024",
  url: string; //"http://ieeevis.org/year/2024/welcome"
};
