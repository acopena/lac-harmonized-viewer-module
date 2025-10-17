import { EnvironmentConfigService } from './services/environment-service';
import * as i18n from "./locales/index"

const env: EnvironmentConfigService = EnvironmentConfigService.getInstance();

export const AppConfig: AppConfig = {
    env: env.get('env'),
    loggingLevel: 'debug',

    /**
     * Reference Systems
     * ====================================================================================
     * 2019-11-07
     * Reference system mappings required to work with CFCS, IIIF api and UCC api.
     * Ideally, this application should not have hardcoded mappings and
     * should be able to forward a unique reference system identifier.
     * ====================================================================================
     */
    referenceSystems: [
        { id: 1, abbr: 'MIK', code: 'FonAndCol', codefr:'CollEtFonds', sourceCode: 1 },
        { id: 2, abbr: 'CAB', code: 'CabCon', codefr:'ConCab', sourceCode: 8 },
        { id: 3, abbr: 'WLM', code: 'DiaWLmKing',codefr:'JouWlmKing', sourceCode: 7 },
        { id: 4, abbr: 'FVS', code: 'FilVidAndSou',codefr:'FilVidEnreSon', sourceCode: 9 },
        { id: 5, abbr: 'OIC', code: 'OrdInCou', codefr:'DécretCons',sourceCode: 5 },
        { id: 6, abbr: 'MAS', code: 'PosOffPosMas',codefr:'BurMaiPostes', sourceCode: 6 },
        { id: 7, abbr: 'CEN', code: 'Census', codefr:'Recensements',sourceCode: 2 },
        { id: 8, abbr: 'POR', code: 'PorRos', codefr:'porros',sourceCode: 17 },
        { id: 9, abbr: 'COU', code: 'CouMarWwi',codefr:'coumarwwi', sourceCode: 23 },
        { id: 10, abbr: 'FWW', code: 'PfFww',codefr:'pgmdp', sourceCode: 16 },
        { id: 11, abbr: 'NWP', code: 'Nwmp',codefr:'pcno', sourceCode: 18 },
        { id: 12, abbr: 'NAV', code: 'RoyNavLed',codefr:'marroyled', sourceCode: 24 },
        { id: 13, abbr: 'KIA', code: 'Kia', codefr:'Mac',sourceCode: 4 },
        { id: 14, abbr: 'IND', code: 'IndAffAnnRep',codefr:'rapanaffind', sourceCode: 20 },
        { id: 16, abbr: 'RCA', code: 'Rcap',codefr:'crpa', sourceCode: 19 },
        { id: 17, abbr: 'LPT', code: 'LanPetLowCan',codefr:'demterbascan', sourceCode: 30 },
        { id: 18, abbr: 'UPT', code: 'LanPetUppCan', codefr:'demterhaucan',sourceCode: 31 },
        { id: 19, abbr: 'BOA', code: 'LanBoaUppCan',codefr:'landboahaucan', sourceCode: 29 },
        { id: 20, abbr: 'PUB', code: 'CanPosOffPub',codefr:'puboffposcan', sourceCode: 21 },
        { id: 21, abbr: 'MCC', code: 'CitRegMtlCirCou', codefr:'enrcitcoucirmtl',sourceCode: 22 },
        { id: 22, abbr: 'I65', code: 'ImmBef1865', codefr:'immava1865',sourceCode: 28 },
        { id: 23, abbr: 'IMR', code: 'ImmRusEmp', codefr:'immemprus',sourceCode: 27 },
        { id: 24, abbr: 'IWC', code: 'IndResWesCan', codefr:'ResPremNatOueCan',sourceCode: 12 },
        { id: 25, abbr: 'IFC', code: 'ImmFroChi', codefr:'immdechi',sourceCode: 26 },
        { id: 26, abbr: 'CGZ', code: 'CanGaz',codefr:'GazCan', sourceCode: 13 },
        { id: 27, abbr: 'MHA', code: 'MedHonAwa', codefr:'medhonrecmil',sourceCode: 33 },
        { id: 28, abbr: 'W12', code: 'War1812', codefr:'guerre1821',sourceCode: 34 },        
        { id: 29, abbr: 'BON', code: 'CarPapBooOfNeg', codefr:'carpapbooneg',sourceCode: 36 },
        { id: 30, abbr: 'LAS', code: 'CarPapLoyAndSol', codefr:'carpaploysolbrit',sourceCode: 37 },
        { id: 41, abbr: 'OIR', code: 'oic-register', codefr:'oic-register',sourceCode: 41 },
        { id: 49, abbr: 'PAS', code: 'PasLisAndBorEnt', codefr:'paslisandborent',sourceCode: 49 },
        { id: 50, abbr: 'NAT', code: 'natrec', codefr:'natrec',sourceCode: 50 },
        { id: 51, abbr: 'IGI', code: 'ImmAtGroIle', codefr:'ImmAtGroIle',sourceCode: 51 },        
        { id: 52, abbr: 'UCN', code: 'UppCanNatRec', codefr:'UppCanNatRec',sourceCode: 52 },
        { id: 53, abbr: 'DOM', code: 'ImmPorDom', codefr:'ImmPorDom',sourceCode: 53 },
        { id: 54, abbr: 'MTL', code: 'MtlEmiSocPasBoo', codefr:'MtlEmiSocPasBoo',sourceCode: 54 }        
    ],

    manifestUri: env.get('manifestUrl'),
    manifestFallBackUri: env.get('manifestFallBackUrl'),
    centralApi: env.get('centralApi'),
    recordUrl : env.get('recordUrl'),
    uccApi: env.get('uccApi'),
    centralImgUri: env.get('centralImgUrl'),
    colabUrl:env.get('colabUrl'),

    identityProvider: {
        authority: env.get('authority'),
        clientId: 'OIDCProxy',
        redirectUri: env.get('redirect_uri'),
        //'http://localhost:3334/callback.html',
        //'http://v41extweb01-d.services.bac-lac.gc.ca:3334/signin-callback',
        //'http://v41extcapps01-d.dev.bac-lac.gc.ca:8096/api/auth/callback',
        scope: 'openid profile',
        logoutRedirectUri: window.location.href, //'http://v41extweb01-d.services.bac-lac.gc.ca:3334/logout-callback'
    },

    languages: [
        i18n.locales.en,
        i18n.locales.fr
    ],

    errors: [
        { code: 'e-ex', severity: 'fatal' },
        { code: 'e-refsys-missing', severity: 'warning' },
        { code: 'e-refsys-invalid', severity: 'fatal' },
        { code: 'e-id-missing', severity: 'warning'},
        { code: 'e-save', severity: 'error' },
        { code: 'e-alck', severity: 'warning'}
    ],

    recaptcha: {
        siteKey: '6LfVTMAUAAAAAIVaMvsLKTrsF2WqIPReqgNDrBDK',
        actions: [
            {
                name: 'contribute',
                action: 'ucc_contribute'
            }
        ]
    },

    lockStorageKey: 'ucc-lock'
}
