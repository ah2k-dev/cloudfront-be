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

const spotifyFunction = async (spotifyId) => {
  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `430f6b1e5e904acf9dbb2e66da920ca8:d9cdf2f2745944e1a22f83204ec13afd`
          )}`,
        },
        body: "grant_type=client_credentials",
      }
    );
    const tokenData = await tokenResponse.json();
    if (!tokenResponse) {
      throw new Error("Failed to fetch access token");
    }

    const accessToken = tokenData.access_token;

    if (accessToken) {
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/users/${spotifyId}`,
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
      console.log("profile", artistData);
      const followers = artistData.followers.total;
      const formattedFollowers = formatFollowers(followers);
      console.log(formattedFollowers);
      return formattedFollowers;
    }
  } catch (err) {
    console.log("error", err);
  }
};

// const fetchInstagramFollowers = async (link) => {
//   // Initialize the ApifyClient with API token
//   // console.log(link.split("/")[3]);
//   const client = new ApifyClient({
//     token: process.env.APIFY_TOKEN,
//   });

//   const instagramUsername = link?.split("/")[3];
//   // Prepare Actor input
//   const input = {
//     usernames: [instagramUsername],
//   };

//   try {
//     // Run the Actor and wait for it to finish
//     const run = await client
//       .actor("apify/instagram-followers-count-scraper")
//       .call(input);

//     // Fetch and print Actor results from the run's dataset (if any)

//     const { items } = await client.dataset(run.defaultDatasetId).listItems();
//     const formattedFollowers = formatFollowers(items[0]?.followersCount);

//     return formattedFollowers;
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

module.exports = {
  spotifyFunction,
  // fetchInstagramFollowers,
};
