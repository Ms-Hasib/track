var randPost = GetRandom(postsArray);

var link_id = getQueryParam("lid");
var pub_id = getQueryParam("pid");
var plan_id = getQueryParam("plid");
var visitor_id = getQueryParam("vid");

var push_offer_id = 3;
var push_offer_type = 2;
var iframe_offer_id = 4;
var iframe_offer_type = 3;

// Set the cookie expiration time to 10 minutes from now
var expireTime = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 mins

if (pub_id !== null && plan_id !== null && link_id !== null && visitor_id !== null) {

  Cookies.set("lid", link_id, {
    expires: expireTime,
  });
  Cookies.set("vid", visitor_id, {
    expires: expireTime,
  });
  Cookies.set("pid", pub_id, {
    expires: expireTime,
  });
  Cookies.set("sid", 0, {
    expires: expireTime,
  });
  Cookies.set("plid", plan_id, {
    expires: expireTime,
  });
  Cookies.set("imps", 0, {
    expires: expireTime,
  });

  window.location.href = randPost;

}

if (Cookies.get("pid") && Cookies.get("lid") && Cookies.get("vid")) {
  var cookie_pub_id = Cookies.get("pid");
  var cookie_link_id = Cookies.get("lid");
  var cookie_visitor_id = Cookies.get("vid");
  var cookie_step_id = Number(Cookies.get("sid"));
  var cookie_pub_plan_id = Number(Cookies.get("plid"));
  var StepsToGo = getStepsToGo(cookie_pub_plan_id);

  target_base = "https://gplinks.co/" + cookie_link_id;
  target_final =
    "https://gplinks.co/" +
    cookie_link_id +
    "/?pid=" +
    cookie_pub_id +
    "&vid=" +
    cookie_visitor_id;

   next_status = cookie_step_id + 1;

  if (cookie_step_id + 1 >= StepsToGo) {
    next_target = target_final;
  } else {
    next_target = randPost;
  }

}

jQuery(function ($) {
  var isOverGoogleAd = false;
  $("iframe[ id *= google ]")
    .mouseover(function () {
      isOverGoogleAd = true;
    })
    .mouseout(function () {
      isOverGoogleAd = false;
    });

  $(window).blur(function () {
      if (isOverGoogleAd) {
        // sendPostback(cookie_pub_id,cookie_visitor_id,iframe_offer_id,iframe_offer_type);
      }
  }).focus();

  function sendPostback(pubId, visitorId, offerId, offerType) {
    const postbackImage = new Image();
    postbackImage.src =
      "https://gplinks.com/track/data.php?request=addConversion&pid=" +
      pubId +
      "&vid=" +
      visitorId +
      "&o_id=" +
      offerId +
      "&o_type=" +
      offerType;
  }
});


window.googletag = window.googletag || { cmd: [] };

googletag.cmd.push(function () {
  googletag.pubads().addEventListener("impressionViewable", (event) => {
       AddImps();
  });
});

function AddImps(){
  var expireTime = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 mins
  var AdImps = Number(Cookies.get("imps"));
  Cookies.set("imps", AdImps + 1, {
    expires: expireTime,
  });
}

if (cookie_pub_id) {
  gtag("set", "user_properties", {
    pid: cookie_pub_id,
  });
}

$(document).ready(function () {
  $("#VerifyBtn").on("click", async function () {
    $("#VerifyBtn").html("Please Wait...");
    var expireTime = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 mins
    var AdImps = Number(Cookies.get("imps"));
    var setVisitor_response = await setVisitor(next_status, AdImps, cookie_visitor_id);
    var ustatus = setVisitor_response.status;
    if (ustatus == "success") {
      Cookies.set("sid", next_status, {
        expires: expireTime,
      });
      Cookies.set("imps", 0, {
        expires: expireTime,
      });
      $("#VerifyBtn").hide();
      $("#GoNewxtDiv").show();
      $("#NextBtn").attr("href", next_target);
      $("#StepInfo").text("Step " + next_status + " of " + StepsToGo);
    }
  });
});

function getStepsToGo(user_plan_id) {
  switch (user_plan_id) {
    case 1:
      return 3;
    case 2:
      return 2;
    case 3:
      return 1;
    case 11:
      return 3;
    case 12:
      return 2;
    default:
      return 3;
  }
}

function GetRandom(postsArray) {
  var randomIndex = Math.floor(Math.random() * postsArray.length);
  var randomString = postsArray[randomIndex];
  return randomString;
}

function getQueryParam(param) {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function BlockedPermission() {
  // Push promt closed or blocked
}

async function handleAllowPermission() {
  // permission granted
  var conversionResponse = await addConversion(
    cookie_pub_id,
    cookie_visitor_id,
    push_offer_id,
    push_offer_type
  );
  var cstatus = conversionResponse.status;
}

(function handlePermission() {
  try {
    return navigator.permissions
      .query({
        name: "notifications",
      })
      .then(permissionQuery)
      .catch(onerror);
  } catch (error) {
    // Handle the error here, or return a default value
    console.error("navigator.permissions.query not supported:", error);
    // Return a default value or handle it as needed
    return null;
  }
})();

function permissionQuery(result) {
  var newPrompt;
  result.onchange = function () {
    if (result.state == "granted") {
      handleAllowPermission();
    } else if (result.state == "prompt") {
      // we can ask the user
      Notification.requestPermission();
    } else if (result.state == "denied") {
      BlockedPermission();
    } else {
      // we can ask the user
      Notification.requestPermission();
    }
  };
  return newPrompt || result;
}

function getVisitor(visitor_id) {
  return $.ajax({
    type: "GET",
    // make sure you respect the same origin policy with this url:
    url: "https://gplinks.com/track/data.php",
    data: {
      request: "getVisitor",
      vid: visitor_id,
    },
    dataType: "json",
  });
}

function getUser(user_id) {
  return $.ajax({
    type: "GET",
    // make sure you respect the same origin policy with this url:
    url: "https://gplinks.com/track/data.php",
    data: {
      request: "getUser",
      uid: user_id,
    },
    dataType: "json",
  });
}

function setVisitor(status, impressions, visitorId) {
  return $.ajax({
    type: "POST",
    // make sure you respect the same origin policy with this url:
    url: "https://gplinks.com/track/data.php",
    data: {
      request: "setVisitor",
      status: status,
      imps: impressions,
      vid: visitorId,
    },
    dataType: "json",
  });
}

function addConversion(pubId, visitorId, offerId, offerType) {
  return $.ajax({
    type: "POST",
    // make sure you respect the same origin policy with this url:
    url: "https://gplinks.com/track/data.php",
    data: {
      request: "addConversion",
      pid: pubId,
      vid: visitorId,
      o_id: offerId,
      o_type: offerType,
    },
    dataType: "json",
  });
}

var SmileyBanner = document.getElementById("SmileyBanner");
var count = 5;
var timerInterval;
var Intervaltime = 100;

if (cookie_pub_plan_id == 12) {
  Intervaltime = 100;
  $(document).ready(function() {
    $(".VerifyBtn, .NextBtn").css("background-color", "#482dff");
  });
}

if (SmileyBanner) {
  count = 5;
  Intervaltime = 100;
}

function isPageVisible() {
  var SmileyBanner = document.getElementById("SmileyBanner");
  if (SmileyBanner) {
    // Set an interval to monitor the active element for iframes.
    var monitor = setInterval(function () {
      var elem = document.activeElement;
      if (elem && elem.tagName == 'IFRAME') {
        $(".SmileyBanner").css("display", "none");
        setTimeout(function () {
          $(".myWaitingDiv").css("display", "block");
        }, 100);
        SetAdCookie();
        setTimeout(function () {
           goVerified();
        }, 10000);
        clearInterval(monitor); // Clear the interval.
        return !document.hidden; // return for on-screen 
      }
    }, 100);
  } else {
      return !document.hidden; // return for on-screen 
  }
}

function goVerified(){
    var gpProgressBar = document.getElementById("gp_progress-bar");
    var timerDiv = document.getElementById("myTimerDiv");
    var nextInst = document.getElementById("myNextInst");
    var verifyBtn = document.getElementById("VerifyBtn");
    var myWaitingDiv = document.getElementById("myWaitingDiv");

    if (gpProgressBar) {
      gpProgressBar.style.display = "none";
    } else if (timerDiv) {
      timerDiv.style.display = "none";
    }
    if (nextInst) {
      nextInst.style.display = "block";
    }
    if (verifyBtn) {
      verifyBtn.style.display = "block";
    }
    if (myWaitingDiv) {
      myWaitingDiv.style.display = "none";
    }
}

function keepClosed(){
  var verifyBtn = document.getElementById("VerifyBtn");
  if (verifyBtn) {
    verifyBtn.style.display = "none";
  }
}

function SetAdCookie(){
  // Set the cookie time to 24 hours from now
   var expireTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours in milliseconds
   Cookies.set("adexp", 1, {
     expires: expireTime,
   });
}

function timer() {
  count = count - 1;

  if (cookie_pub_plan_id == 12) {
    var progressBar = document.getElementById("gp_progress");
    if (progressBar) {
      var progress = ((5 - count) / 5) * 100;
      progressBar.style.width = progress + "%";
    }
  }
  
  if (count <= 0) {
    goVerified();
    clearInterval(timerInterval);
  } else {
    keepClosed();
  }
  
  var myTimerElement = document.getElementById("myTimer");
  if (myTimerElement) {
    myTimerElement.innerHTML = count;
  }
  
}

$(document).ready(function () {
  if (isPageVisible()) {
    timerInterval = setInterval(timer, Intervaltime);
  }

  $(document).on('visibilitychange', function () {
    if (isPageVisible()) {
      timerInterval = setInterval(timer, Intervaltime);
    } else {
      clearInterval(timerInterval);
    }
  });
});
