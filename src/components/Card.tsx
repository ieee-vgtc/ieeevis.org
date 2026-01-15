/**
 *
 * @param param0
 */

export default function Card({
  title,
  description,
  button_text,
  url,
}: {
  title: string;
  description: string;
  button_text: string;
  url: string;
}) {
  return (
    <div className="card">
      <h3 className="heading--base">{title}</h3>
      <p className="text-black">{description}</p>
      <div className="mt-auto">
        <a href={url} className="button button-inverse mt-4">
          {button_text}
        </a>
      </div>
    </div>
  );
}
