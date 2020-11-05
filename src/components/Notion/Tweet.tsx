import Image from "next/image";
import dayjs from "dayjs";

function renderMedia(tweetMedia: any) {
  return (
    <div className="tweet-image">
      <Image
        src={tweetMedia.media_url_https}
        width={tweetMedia.original_info.width}
        height={tweetMedia.original_info.height}
      />
      <style jsx>{`
        .tweet-image {
          max-height: 300px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

export default function Tweet({ tweet }: any) {
  return (
    <div className="container">
      <div className="head">
        <div className="head-wrapper">
          <img
            src={tweet.user.profile_image_url_https}
            alt="tweet profile image"
            className="avatar"
          />
          <div className="user-info">
            <span className="name">
              <span>{tweet.user.name}</span>
              {tweet.user.verified && (
                <span className="verified">
                  <svg
                    fill="white"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22px"
                    style={{ color: "var(--bg)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </span>
              )}
            </span>
            <a
              href={`https://twitter.com/${tweet.user.screen_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              <span className="screen-name">@{tweet.user.screen_name}</span>
            </a>
          </div>
        </div>
        <a
          href={`https://twitter.com/${tweet.user_id_str}/status/${tweet.conversation_id_str}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width="25px"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: tweet.full_text.substr(...tweet.display_text_range).replace(/\n/g, "<br />"),
        }}
      ></div>
      {tweet.entities?.media?.[0] && renderMedia(tweet.entities.media[0])}
      <div className="footer">
        <div className="tweet-data">
          <span>
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>{" "}
            {tweet.favorite_count}
          </span>
          <span>
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>{" "}
            {tweet.reply_count}
          </span>
        </div>
        <span className="tweet-date"> {dayjs(tweet.created_at).format("DD MMM, YYYY")}</span>
      </div>
      <style jsx>{`
        .icon {
          width: 20px;
        }
        .container {
          min-width: 300px;
          max-width: 480px;
          border: solid 1px var(--fgAlt);
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          margin-left: auto;
          margin-right: auto;
        }
        .head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .head .head-wrapper {
          display: flex;
        }
        .head .avatar {
          border-radius: 50%;
        }
        .head .user-info {
          display: flex;
          flex-flow: column;
          margin-left: 1rem;
        }
        .head .user-info .name {
          display: flex;
        }
        .head .user-info .verified {
          display: inline-flex;
          margin-left: 0.2rem;
        }
        .head .link {
          display: inline-flex;
          color: var(--fg);
        }
        .footer {
          display: flex;
          justify-content: space-between;
        }
        @media (max-width: 480px) {
          .footer {
            flex-flow: column;
          }
        }
        .tweet-data {
          display: flex;
        }
        .tweet-data span {
          margin-right: 1rem;
          display: inline-flex;
        }
        .tweet-data span svg {
          margin-right: 0.2rem;
        }
        .tweet-date {
          font-size: 0.9rem;
          color: var(--fgAlt);
        }
      `}</style>
    </div>
  );
}
