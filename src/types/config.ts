export interface Config {
  name: string; //"VIS 2025",
  tagline: string; //"IEEE VIS: Visualization & Visual Analytics",
  date: string; //"2-7 November 2025 Conference",
  startDate: string; //"2025-11-2",
  endDate: string; //"2025-11-7",
  citation_date: string; //"November 2025",
  proceedings_title: string; //"Proceedings of the IEEE VIS 2025 Conference",
  analytics: string; //"UA-",
  logo: {
    image: string; // "/static/2023/images/vis2023_logo_virtual.png",
    width: string; //"250px",
    height: string; //"auto",
  };
  page_title: {
    prefix: string; //"IEEE VIS 2025 Content",
    separator: string; //": "
  };
  background_image: string; //"/static/2023/images/melbourne_splash.jpg",
  organization: string; //"VIS 2025 Organization Committee",
  chat_server: string; //"miniconf.sloppy.zone",
  default_presentation_id: 38922815;
  default_poster_pdf: string; //"/static/images/GLTR_poster.pdf",
  use_auth0: boolean; //false,
  auth0_client_id: string;
  auth0_domain: string;
  calendar: {
    colors: Record<string, string>; //"---": "#1C3160", workshop: "#f4a261",
    sunday_saturday: boolean; // true,
  };
  room_names: Record<string, string>; //"room-0_11_0_12": "Room 0.11 + 0.12",
}
