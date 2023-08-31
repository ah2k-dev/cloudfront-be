// const spotifyProfileAxios = axios.create({
//   baseURL: baseURLspotify,
//   headers: {
//     Authorization: `Bearer ${accessToken}`,
//   },
// });

const { ApifyClient } = require("apify-client");

const formatFollowers = (number) => {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(1) + "B"; // Billion
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + "M"; // Million
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + "K"; // Thousand
  } else {
    return number?.toString(); // Less than a thousand, no formatting needed
  }
};

const spotifyFunction = async (link) => {
  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          //   "grant_type"="client_credentials&client_id=your-client-id&client_secret=your-client-secret"
          Authorization: `Basic ${btoa(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          )}`,
        },
        body: "grant_type=client_credentials",
      }
    );
    // console.log("spotify response", tokenResponse);
    if (!tokenResponse) {
      throw new Error("Failed to fetch access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    // console.log(accessToken);

    if (link) {
      const spotifyLink = link?.split("?")[0];
      const spotifyId = spotifyLink.split("/")[4];

      const artistResponse = await fetch(
        `https://api.spotify.com/v1/artists/${spotifyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!artistResponse.ok) {
        throw new Error("Failed to fetch artist data");
      }

      const artistData = await artistResponse.json();
      const followers = artistData.followers.total;
      const formattedFollowers = formatFollowers(followers);
      return formattedFollowers;
      // } else {
      //   console.error("The provided link is not from Spotify");
      // }
    }
  } catch (err) {
    console.log(err);
  }
};

const fetchInstagramFollowers = async (link) => {
  // Initialize the ApifyClient with API token
  // console.log(link.split("/")[3]);
  const client = new ApifyClient({
    token: "apify_api_t6hlz6cuOncNgAjutNHHBdFOSivM0W0WL1uF",
  });

  const instagramUsername = link?.split("/")[3];
  // Prepare Actor input
  const input = {
    usernames: [instagramUsername],
  };

  try {
    // Run the Actor and wait for it to finish
    const run = await client
      .actor("apify/instagram-followers-count-scraper")
      .call(input);

    // Fetch and print Actor results from the run's dataset (if any)

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const formattedFollowers = formatFollowers(items[0]?.followersCount);

    return formattedFollowers;
  } catch (error) {
    console.error("Error:", error);
  }
};

fetchInstagramFollowers("https://www.instagram.com/varundvn/?hl=en");
module.exports = {
  spotifyFunction,
  fetchInstagramFollowers,
};
