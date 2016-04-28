function getEmptyStitch() {
  return {
    id: -1,          // stitch ID
    stitchTitle: "", // user title for stitch
    description: "", // user description of stitch
    url: "",         // url of stitch
    favIconUrl: "",  // fav icon URL (path to chrome://favicons
    stitchType: "",  // type of stitch
    rating: "",      // user rating
    tags: [],        // tag strings
    threads: [],     // thread ids of threads that contain this stitch
    yarns: []        // yarns ids of yarns that include this stitch
  };
}

function getEmptyThread() {
  return {
    id: -1,          // thread ID
    threadTitle: "", // user title for thread
    description: "", // user description
    rating: "",      // user rating
    stitches: [],    // stitch ids of stitches in the thread
    yarns: []        // yarn ids of yarns in the thread
  }
}

function getEmptyYarn() {
  return {
    id: -1,          // yarn ID
    yarnType:"",     // type of yarn
    fromStitch:"",   // stitch id of "from" stitch
    toStitch:""      // stitch id of "to" stitch
  }
}