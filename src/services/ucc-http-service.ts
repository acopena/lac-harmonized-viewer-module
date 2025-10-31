import axios, { AxiosResponse } from "axios";
import { AppConfig } from "../app.config";
import { debug } from "../utils/utils";

interface ContributionLock {
  ecopy: string;
  lockId: number;
  expiresAt: number;
}

export class UccHttpService {
  lockExpirationSeconds: number = 15;

  private url: string = AppConfig.uccApi;
  //private url: string = '//localhost:8080/sample.json?x='

  private lockAutoRenewTimeout: number;

  // manifestUri: env.get('manifestUrl'),
  // manifestFallBackUri: env.get('manifestFallBackUrl')

  async getManifest(mainUrl: string, fallbackUrl: string): Promise<HttpResponse> {
    if (!fallbackUrl) {
      return undefined;
    }
    let value: HttpResponse = null;

    await axios.get(fallbackUrl, { validateStatus: status => status === 200 })
      .then(async (response) => {
        value = {
          status: response.status,
          data: response.data,
          url: mainUrl
        };
      })
      .catch(async (e) => {
        console.log('do fallback when there is an error');
        throw new Error('manifest-not-found');     

      });
    return value;

  }

  async getUccContributionItems(eCopyitems: string): Promise<HttpResponse> {
    if (!eCopyitems) {
      return undefined;
    }
    //temp for testin point to localhost
    // const url = 'http://localhost:5191/api/Colab/GetColabMcwList';  // localhost for testing
    const url = this.url + "/GetColabMcwList"; // "/ContributionItems";  //production
    let value: HttpResponse = null;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    }
    var response = await axios.post(url, eCopyitems, {
      headers: headers
    });
    switch (response.status) {
      case 200:
        value = {
          status: response.status,
          data: response.data,
        };
        break;
      case 404:
        value = {
          status: response.status,
        };
        break;
      default:
        value = {
          status: response.status,
        };
        break;
    }
    return value;
  }
  async read(ecopy: string): Promise<HttpResponse> {
    if (!ecopy) {
      return undefined;
    }

    let value: HttpResponse = null;

    const url = this.url + "/Read/" + ecopy;
    console.log(url);
    const response = await axios.get(url);    
    switch (response.status) {
      case 200:
        value = {
          status: response.status,
          data: response.data,
        };
        break;
      case 404:
        value = {
          status: response.status,
        };
        break;
      default:
        value = {
          status: response.status,
        };
        break;
    }
    return value;
  }

  async autocomplete(keywords: string) {
    if (!keywords) {
      return undefined;
    }

    const url =
      this.url + "/AutoComplete?prefix=" + encodeURIComponent(keywords);
    return await axios.get(url);
  }

  async create(ecopy: string, request: UserContributionCreateRequest) {
    if (!ecopy || !request) {
      console.log(`Could not perform request for ecopy: ${ecopy}`);
      return undefined;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    }

    const url = this.url + "/Create";
    return await axios.post(url, JSON.stringify(request), { headers: headers });
  }

  async obtainLock(ecopy: string, autoRenew: boolean = false) {
    if (!ecopy) {
      return undefined;
    }

    let lockId = -1;
    ecopy = ecopy.trim().toLowerCase();

    const sessionLock = this.getSessionLock(ecopy);
    if (sessionLock) {
      // Lock was found in local storage

      if (this.isLockExpired(sessionLock)) {
        // Lock has expired, attempt to renew...
        const renewed = await this.updateLock(ecopy, sessionLock.lockId);

        if (renewed) {
          // Lock renewed
          return sessionLock.lockId;
        }
      } else {
        // Lock is still active
        return sessionLock.lockId;
      }
    }

    try {
      // Obtain new lock...
      const response = await axios.get(this.url + "/GetLock/" + ecopy);
      lockId = Number(response.data);

      // Save new lock to local storage
      this.saveSessionLock(ecopy, lockId);

      if (autoRenew) {
        // Create a timer which will renew the lock after a period of time
        this.lockAutoRenewTimeout = window.setTimeout(
          () => this.updateLock(ecopy, lockId),
          this.lockExpirationSeconds * 1000,
          ecopy,
          lockId
        );
      }
    } catch (e) {
      const response = e.response as AxiosResponse<any>;

      if (response.status == 400) {
        // 400 bad request (lock already exists)
        throw "e-alck";
      } else {
        throw e;
      }
    }

    return lockId;
  }

  cancelAutoRenew(): void {
    if (this.lockAutoRenewTimeout) {
      window.clearTimeout(this.lockAutoRenewTimeout);
    }
  }

  getSessionLock(ecopy: string): ContributionLock {
    if (!ecopy) {
      return undefined;
    }

    return this.getAllSessionLocks(ecopy).find((i) => i.ecopy === ecopy);
  }

  getAllSessionLocks(ecopy: string): ContributionLock[] {
    if (!ecopy) {
      return undefined;
    }

    let sessionLocks: ContributionLock[] = [];

    const sessionLocksJson = window.sessionStorage.getItem(
      AppConfig.lockStorageKey
    );
    if (sessionLocksJson) {
      sessionLocks = JSON.parse(sessionLocksJson) as ContributionLock[];
    }

    return sessionLocks;
  }

  isLockExpired(lock: ContributionLock): boolean {
    if (!lock) {
      return undefined;
    }

    return lock.expiresAt <= new Date().getTime();
  }

  saveSessionLock(ecopy: string, lockId: number): void {
    if (!ecopy || lockId === -1) {
      return undefined;
    }

    ecopy = ecopy.trim().toLowerCase();

    const expiresAt = new Date().getTime() + this.lockExpirationSeconds * 1000;

    let sessionLocks = this.getAllSessionLocks(ecopy);
    let sessionLock = sessionLocks.find((i) => i.ecopy == ecopy);

    if (!sessionLock) {
      sessionLock = {
        ecopy: ecopy,
        lockId: lockId,
        expiresAt: expiresAt,
      };
      sessionLocks = [...sessionLocks, sessionLock];
    } else {
      sessionLock.lockId = lockId;
      sessionLock.expiresAt = expiresAt;
    }

    window.sessionStorage.setItem(
      AppConfig.lockStorageKey,
      JSON.stringify(sessionLocks)
    );
  }

  async updateLock(ecopy: string, lockId: number): Promise<boolean> {
    if (!ecopy || lockId === -1) {
      return undefined;
    }

    try {
      const url = this.url + "/UpdateLock/" + ecopy;
      const response = await axios.post(
        url,
        JSON.stringify({
          lockId: lockId,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        debug("Lock renewed", lockId);
        this.saveSessionLock(ecopy, lockId);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      e.response as AxiosResponse<any>;
      debug("Failed to renew");
      return false;
    }
  }

  async releaseLock(ecopy: string, lockId: number) {
    if (!ecopy || !lockId) {
      return undefined;
    }

    const url = this.url + "/ReleaseLock/" + ecopy;
    return await axios.post(
      url,
      JSON.stringify({
        lockId: lockId,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  async save(request: UserContributionRequest) {
    if (!request) {
      return undefined;
    }

    // Submit recaptcha token
    const grecaptcha = (window as any).grecaptcha;
    //grecaptcha.ready(async () => { //to-do: move ready callback out of the save function

    let recaptchaToken = null;

    const repcatchaSiteKey = AppConfig.recaptcha.siteKey;
    const recaptchaAction = AppConfig.recaptcha.actions.find(
      (i) => i.name === "contribute"
    );
    if (repcatchaSiteKey && recaptchaAction) {
      recaptchaToken = await grecaptcha.execute(repcatchaSiteKey, {
        action: recaptchaAction.action,
      });
    }

    if (recaptchaToken) {
      request._request.captcha = recaptchaToken;

      const url = this.url + "/Contribute/" + request._request.ecopy;
      console.log(url);
      return await axios.post(url, JSON.stringify(request), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    //})
  }

  mapToLocal(response: ContributionResponse): ContributionLocal {
    let local: ContributionLocal = {
      id: null,

      transcriptionStatus: "NS",
      transcriptionSupported: false,
      transcriptionLocked: false,
      transcriptionValue: null,

      translationStatus: "NS",
      translationSupported: false,
      translationLocked: false,
      translationValue: null,

      taggingSupported: false,
      taggingLocked: false,
      taggingGlobalTags: [],
      taggingLocalTags: [],

      descriptionStatus: "NS",
      descriptionSupported: false,
      descriptionLocked: false,
      descriptionPageNumber: null,
      descriptionPageNumberSupported: false,
      descriptionDate: null,
      descriptionDateSupported: false,
      descriptionCircaDate: null,
      descriptionCircaDateSupported: false,
      descriptionTitleEn: null,
      descriptionTitleFr: null,
      descriptionTitleSupported: false,
      descriptionFileTitleEn: null,
      descriptionFileTitleFr: null,
      descriptionFileTitleSupported: false,
      descriptionDescriptionEn: null,
      descriptionDescriptionFr: null,
      descriptionDescriptionSupported: false,
      descriptionPlaceSupported: false,
      descriptionCityEn: null,
      descriptionCityFr: null,
      descriptionStateProvinceEn: null,
      descriptionStateProvinceFr: null,
      descriptionCountryEn: null,
      descriptionCountryFr: null,
    };

    if (!response) return local;

    // Map transcriptions, translations, tags and descriptions
    if (response.digitalObject) {
      const digitalObject = response.digitalObject;
      local.id = digitalObject.ecopyNumber;

      if (digitalObject.uccSetting) {
        const uccSetting = digitalObject.uccSetting;
        local.transcriptionSupported = uccSetting.transcripSupp;
        local.transcriptionLocked = uccSetting.transcripDisp;

        local.translationSupported = uccSetting.translateSupp;
        local.translationLocked = uccSetting.translateDisp;

        local.taggingSupported = uccSetting.tagsSupp;
        local.taggingLocked = uccSetting.tagsDisp;

        local.descriptionSupported = uccSetting.metadataSupp;
        local.descriptionLocked = uccSetting.metadataDisp;
        local.descriptionPageNumberSupported = uccSetting.metadataPageNumber;
        local.descriptionDateSupported = uccSetting.metadataDate;
        local.descriptionCircaDateSupported = uccSetting.metadataCircaData;
        local.descriptionTitleSupported = uccSetting.metadataTitle;
        local.descriptionFileTitleSupported = uccSetting.metadataFileTitle;
        local.descriptionDescriptionSupported = uccSetting.metadataDescription;
        local.descriptionPlaceSupported = uccSetting.metadataPlace;
      }

      if (digitalObject.digitalObjectTag) {
        let tags: Tag[] = [];

        if (digitalObject.digitalObjectTag instanceof Array) {
          tags = digitalObject.digitalObjectTag.map((tag) => this.mapTag(tag));
        }

        local.taggingLocalTags = tags
          .filter((tag) => !tag.global)
          .map((tag) => tag as LocalTag);
        local.taggingGlobalTags = tags
          .filter((tag) => tag.global)
          .map((tag) => tag as GlobalTag);
      }

      if (response.lastContributionTranscript) {
        const lastContributionTranscript = response.lastContributionTranscript;
        local.transcriptionStatus =
          lastContributionTranscript.digObjContribStatusCode;
        local.transcriptionValue = lastContributionTranscript.text;
      }

      if (response.lastContributionTranslate) {
        const lastContributionTranslate = response.lastContributionTranslate;
        local.translationStatus =
          lastContributionTranslate.digObjContribStatusCode;
        local.translationValue = lastContributionTranslate.text;
      }

      if (response.lastMetadata) {
        const lastMetadata = response.lastMetadata;
        local.descriptionStatus = lastMetadata.digObjMetaStatusCode;
        local.descriptionPageNumber = lastMetadata.pageNumber;
        local.descriptionDate = lastMetadata.date;
        local.descriptionCircaDate = lastMetadata.circadate;
        local.descriptionTitleEn = lastMetadata.titleEn;
        local.descriptionTitleFr = lastMetadata.titleFr;
        local.descriptionFileTitleEn = lastMetadata.fileTitleEn;
        local.descriptionFileTitleFr = lastMetadata.fileTitleFr;
        local.descriptionDescriptionEn = lastMetadata.descriptionEn;
        local.descriptionDescriptionFr = lastMetadata.descriptionFr;
        local.descriptionCityEn = lastMetadata.cityEn;
        local.descriptionCityFr = lastMetadata.cityFr;
        local.descriptionStateProvinceEn = lastMetadata.stateProvEn;
        local.descriptionStateProvinceFr = lastMetadata.stateProvFr;
        local.descriptionCountryEn = lastMetadata.countryEn;
        local.descriptionCountryFr = lastMetadata.countryFr;
      }
    }

    return local;
  }

  mapTag(data: any): Tag {
    if (!data || !data.tag) {
      return undefined;
    }

    if (data.isGlobalTag) {
      return <GlobalTag>{
        global: true,
        id: data.id,
        text: data.tag.text,
        deleted: false,
      };
    } else {
      return <LocalTag>{
        id: data.id,
        text: data.tag.text,
        global: false,
        deleted: false,
        x: Number(data.x),
        y: Number(data.y),
      };
    }
  }

  mapRequest(
    userId: string,
    lockId: number,
    ecopy: string,
    local: ContributionLocal
  ): UserContributionRequest {
    return {
      _request: {
        userId: userId === null ? "1" : userId, // '1' means anonymous contribution
        lock: lockId,
        ecopy: ecopy,
        action: "save",
      },
      transcription: {
        status: local.transcriptionStatus,
        text: local.transcriptionValue,
      },
      translation: {
        status: local.translationStatus,
        text: local.translationValue,
      },
      tags: {
        local:
          local.taggingLocalTags &&
          local.taggingLocalTags.map((tag) => {
            const operation = tag.deleted ? "delete" : "insert";
            return { ...tag, _operation: operation } as TagRequest;
          }),
        global:
          local.taggingGlobalTags &&
          local.taggingGlobalTags.map((tag) => {
            const operation = tag.deleted ? "delete" : "insert";
            return { text: tag.text, _operation: operation } as TagRequest;
          }),
      },
      description: {
        status: local.descriptionStatus,
        mainDetails: {
          pageNumber: local.descriptionPageNumber,
          date: local.descriptionDate,
          circaDate: local.descriptionCircaDate,
        },
        details: [
          {
            language: "en",
            title: local.descriptionTitleEn,
            fileTitle: local.descriptionFileTitleEn,
            description: local.descriptionDescriptionEn,
            city: local.descriptionCityEn,
            stateProvince: local.descriptionStateProvinceEn,
            country: local.descriptionCountryEn,
          },
          {
            language: "fr",
            title: local.descriptionTitleFr,
            fileTitle: local.descriptionFileTitleFr,
            description: local.descriptionDescriptionFr,
            city: local.descriptionCityFr,
            stateProvince: local.descriptionStateProvinceFr,
            country: local.descriptionCountryFr,
          },
        ],
      },
    };
  }


  async exportContribution(ecopy: string, titleEn: string, titleFr: string, foundinen: string, foundinfr: string, referenceen: string, referencefr: string) {

    try {
      const url = this.url + "/ContributionDownload/" + ecopy;
      console.log(url);
      let data = JSON.stringify({
        titleEn: titleEn,
        titleFr: titleFr,
        foundInEn: foundinen,
        foundInFr: foundinfr,
        referenceEn: referenceen,
        referenceFr: referencefr,
      });
      await axios.post(url, data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          console.log(response);
          console.log(response.data);
          const urlHost = new URL(this.url);
          const urlPdf = urlHost.origin + '/assets/pdf/' + response.data;
          let link = document.createElement('a');
          link.href = urlPdf;
          link.target = "blank";
          const fileName = response.data;
          link.download = fileName;
          link.click();
          setTimeout(() => {
            const urlRemoved = this.url + "/ContributionRemovePdf?ecopy=" + ecopy;
            console.log(urlRemoved);
            fetch(urlRemoved);            
          }, 1000);
        });
    }
    catch (e) {
      e.response as AxiosResponse<any>;
      debug("Failed to renew");
    }
  }

  saveByteArray(reportName, byte) {
    const blob = new Blob([byte], { type: "application/pdf" });
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const fileName = reportName;
    link.download = fileName;
    link.click();
  };



  base64ToArrayBuffer(base64) {
    let binaryString = window.atob(base64);
    let binaryLen = binaryString.length;
    let bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      const ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }


}
