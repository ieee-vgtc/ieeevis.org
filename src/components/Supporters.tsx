export default function Supporters({
  title,
  description,
  button_text,
  button_link,
  supporters,
}: SupportersMetaDataType) {
  return (
    <div className="container">
      <div className="flex lg:flex-row flex-col sm:mt-24 mt-12">
        <div className="w-full lg:w-1/3 mb-12 text-measure">
          <h2 className="mb-6 ">{title}</h2>
          <p className="mb-6 text-primary text-xl">{description}</p>
          <a className="button button-blue" href={button_link}>
            {button_text}
          </a>
        </div>

        <div className="w-full lg:w-2/3 lg:ml-12">
          {supporters?.map((supporter_group) => (
            <div className="supporters__row ">
              <h3 className="heading-alt text-sm text-gray-500">
                {supporter_group.category}
              </h3>
              <div className="flex flex-wrap items-center">
                {supporter_group.supporters.map((supporter) => (
                  <a href={supporter.url} target="_blank">
                    <img
                      className={`mr-8 mb-6 supporter__logo ${supporter_group.image_size ? "supporter__logo--custom" : ""}`}
                      style={{
                        width: `${supporter_group?.image_size}px`,
                      }}
                      src={supporter.image}
                      alt={supporter.name}
                    />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type SupportersMetaDataType = {
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  supporters: SupporterCategoryDataType[] | null;
};

type SupporterCategoryDataType = {
  category: string;
  image_size?: number;
  supporters: SupporterDataType[];
};

type SupporterDataType = {
  name: string;
  image: string;
  url: string;
};
