import Axios from "axios";
import { getUser } from "./permission-service";
import { AppConfig } from '../app.config';

//http://central.bac-lac.gc.ca/.item?app=filvidandsou&id=13144&op=video&download=1
export async function downloadSingleFile(url: string, fileType: string) {
  
  const centralUrl = `${url}&download=1`;

  switch (fileType.toLocaleLowerCase()) {
    case "image":
    case "pdf":
    case "document":
      await downloadOpenFile(centralUrl);
      break;

    case "video":
      await downloadVideoFile(centralUrl);
      break;

    default:
      break;
  }
}

export async function downloadImagesAsPdfFile(imgIdList: string, itemnumber: string, referenceSystems: string) {
  // const centralAllImgUrl = "https://central.bac-lac.gc.ca/.gen?op=pdf&disclaimer=1&list=";
  //let centralDownloadUrl = centralAllImgUrl + imgIdList;
  //await downloadOpenFile(centralDownloadUrl);

  // Download images using HTTP post
  const centralAllImgUrl =  AppConfig.centralImgUri; // "https://central.bac-lac.gc.ca/.gen";
  await downloadImages(centralAllImgUrl, imgIdList, itemnumber, referenceSystems);
}

async function downloadImages(url: string, list: string, itemnumber: string, referenceSystems: string ) {
  console.log("Downloading file...");
  const user = await getUser();
  // Prepare and send initial request to Central
  const authorization: any =
    user && user.token_type && user.access_token ? undefined : undefined; // to-do: resolve Central auth token

  const centralHeaders: any = {};
  if (authorization) {
    centralHeaders["Authorization"] = authorization;
  }

  const AverageImageSize = 124000; //Estimated size of an image in byte
  const totalList = list.split(";").length + 1; // total list of images.
  const totalSize = totalList * AverageImageSize;

  //console.log("total size:" + totalSize.toString());

  //Set the request body
  //var data = JSON.stringify({
  //  'op':'pdf',
  //  'disclaimer':'1',
  //  'list':list
  //});


  var bodyFormData = new FormData();
  bodyFormData.append("op", "pdf");
  bodyFormData.append("disclaimer", "1");
  bodyFormData.append("foundin", referenceSystems);
  bodyFormData.append("idnumber", itemnumber);
  bodyFormData.append("list", list);

  //display downloading and downloading status
  let isRunning = true;
  var progress = document.getElementById("progress");
  var progressLine = document.getElementById("progressLine");

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  await Axios.post(url, bodyFormData, {
    headers: headers,
    validateStatus: (status) => status === 200,
    responseType: "blob",
    onDownloadProgress: (progressEvent) => {
      isRunning = false;
      if (!isRunning) {
        document.getElementById("meter").style.display =  "block";
        progressLine.style.display = "none";
      }
      let percentCompleted = Math.round(
        (progressEvent.loaded * 100) / totalSize
      );

      if (percentCompleted <= 100) {
        progress.style.width = percentCompleted + "%";
      }
    },
  })
    .then((response) => {
      console.log("succcess");

      const disposition = response.headers["content-disposition"];
      progress.innerHTML = "";
      let newFileName = 'BAC-LAC_' + referenceSystems + '_' + itemnumber + '.pdf';

      var matches = /"([^"]*)"/.exec(disposition);
      const filename = matches != null && matches[1] ? matches[1] : newFileName;
      console.log(filename);

      const pdfFile = new Blob([response.data],{ type: "application/pdf" });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        console.log('ie download only using msSaveOrOpenBlob');
        window.navigator.msSaveOrOpenBlob(pdfFile,filename);
      } else {
        const url = window.URL.createObjectURL(pdfFile);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.setAttribute("download", filename); //or any other extension
        document.body.appendChild(link);
        console.log("set attributes download");
        link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        //link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    })
    .catch((e) => {
      console.log(e);
    });
}
async function downloadOpenFile(
  url: string /*, filename: string, contentType: string*/
) {
  console.log("Downloading file...");

  const presentFrame = document.body.querySelector("iframe#downloadFrame");
  if (presentFrame) {
    presentFrame.remove();
  }
  const iframe = document.createElement("iframe");
  iframe.id = "downloadFrame";
  iframe.setAttribute("src", url);
  iframe.style.display = "none"; // just in case
  document.body.appendChild(iframe);

  return;
  /*
        return Axios.get(url,
                    {
                        responseType: 'blob',
                        validateStatus: status => status === 200
                    }
            )
            .then((response) => {

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${filename}.${contentType}`);

                document.body.appendChild(link);
                link.click();
                console.log("File downloaded.");
                link.remove();
            })
            .catch((e) => {
                console.log(e);
            });
    */
}

async function downloadVideoFile(url: string) {
  console.log("Downloading file...");

  const user = await getUser();

  // Prepare and send initial request to Central
  const authorization: any =
    user && user.token_type && user.access_token ? undefined : undefined; // to-do: resolve Central auth token

  const centralHeaders: any = {};
  if (authorization) {
    centralHeaders["Authorization"] = authorization;
  }

  await Axios.get(url, {
    headers: centralHeaders,
    validateStatus: (status) => status === 200,
  })
    .then((centralResponse) => {
      const fseLink = centralResponse.data;
      const fseAuthorization = centralResponse.headers["authorization"];

      return Axios.get(fseLink, {
        headers: { Authorization: fseAuthorization },
        validateStatus: (status) => status === 200,
      });
    })
    .then((fseResponse) => {
      const data = fseResponse.data;
      if (!data) {
        throw new Error("FSE did not provide valid data object.");
      }

      let frame = document.createElement("iframe");
      frame.setAttribute("src", data.url);
      document.body.appendChild(frame);
      console.log("File sent to disk for downloading.");
    })
    .catch((e) => {
      console.log(e);
    });
}
