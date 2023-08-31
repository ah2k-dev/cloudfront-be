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
  console.log(link);
  const spotifyPattern =
    /^(https?:\/\/open\.spotify\.com|spotify)(\/(track|album|artist|playlist|user\/[a-zA-Z0-9]+\/playlist)\/[a-zA-Z0-9]+)$/;

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      //   "grant_type"="client_credentials&client_id=your-client-id&client_secret=your-client-secret"
      Authorization: `Basic ${btoa(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      )}`,
    },
    body: "grant_type=client_credentials",
  });
  console.log(tokenResponse);
  if (!tokenResponse.ok) {
    throw new Error("Failed to fetch access token");
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  console.log(accessToken);

  if (link) {
    const spotifyLink = link?.split("?")[0]; // Remove query parameters
    if (spotifyLink.match(spotifyPattern) !== null) {
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
    } else {
      console.error("The provided link is not from Spotify");
    }
  }
};

const fetchInstagramFollowers = async (name) => {
  // Initialize the ApifyClient with API token
  const client = new ApifyClient({
    token: "apify_api_t6hlz6cuOncNgAjutNHHBdFOSivM0W0WL1uF",
  });

  // Prepare Actor input
  const input = {
    usernames: [name],
  };

  try {
    // Run the Actor and wait for it to finish
    const run = await client
      .actor("apify/instagram-followers-count-scraper")
      .call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log("Results from dataset");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return JSON.stringify(items);
  } catch (error) {
    console.error("Error:", error);
  }
};

// const fetchGoogleSearchResults = async () => {
//   // Specify your API token
//   // (find it at https://console.apify.com/account#/integrations)
//   const myToken = "apify_api_t6hlz6cuOncNgAjutNHHBdFOSivM0W0WL1uF";

//   // Start apify/google-search-scraper actor
//   // and pass some queries into the JSON body
//   try {
//     const response = await got.post({
//       url: `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${myToken}`,
//       json: {
//         queries: "web scraping\nweb crawling",
//       },
//       responseType: "json",
//     });

//     const items = response.body;

//     // Log each non-promoted search result for both queries
//     items.forEach((item) => {
//       const { nonPromotedSearchResults } = item;
//       nonPromotedSearchResults.forEach((result) => {
//         const { title, url, description } = result;
//         console.log(`${title}: ${url} --- ${description}`);
//       });
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };

// Example usage
// fetchInstagramFollowers("iamzubairarif");
// spotifyFunction(
//   "https://open.spotify.com/artist/2oSONSC9zQ4UonDKnLqksx?si=Jvw9K8hLTD2K7lgZRPcOPA"
// );

module.exports = {
  spotifyFunction,
  fetchInstagramFollowers,
};
