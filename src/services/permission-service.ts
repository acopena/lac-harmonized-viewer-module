import { copyFileSync } from "fs";
import oidc from "oidc-client";
import { AppConfig } from "../app.config";

export interface IdentityUser {
  access_token: string;
  expires_at: number;
  id_token: string;
  profile: IdentityProfile;
  refresh_token?: string;
  scope: string;
  session_state?: string;
  state: string;
  token_type: string;
}

export type IdentityProfile = IDTokenClaims & ProfileStandardClaims;

interface IDTokenClaims {
  /** Issuer Identifier */
  iss: string;
  /** Subject identifier */
  sub: string;
  /** Audience(s): client_id ... */
  aud: string;
  /** Expiration time */
  exp: number;
  /** Issued at */
  iat: number;
  /** Time when the End-User authentication occurred */
  auth_time?: number;
  /** Time when the End-User authentication occurred */
  nonce?: number;
  /** Access Token hash value */
  at_hash?: string;
  /** Authentication Context Class Reference */
  acr?: string;
  /** Authentication Methods References */
  amr?: string[];
  /** Authorized Party - the party to which the ID Token was issued */
  azp?: string;
  /** Session ID - String identifier for a Session */
  sid?: string;

  /** Other custom claims */
  [claimKey: string]: any;
}

interface ProfileStandardClaims {
  /** End-User's full name */
  name?: string;
  /** Given name(s) or first name(s) of the End-User */
  given_name?: string;
  /** Surname(s) or last name(s) of the End-User */
  family_name?: string;
  /** Middle name(s) of the End-User */
  middle_name?: string;
  /** Casual name of the End-User that may or may not be the same as the given_name. */
  nickname?: string;
  /** Shorthand name that the End-User wishes to be referred to at the RP, such as janedoe or j.doe. */
  preferred_username?: string;
  /** URL of the End-User's profile page */
  profile?: string;
  /** URL of the End-User's profile picture */
  picture?: string;
  /** URL of the End-User's Web page or blog */
  website?: string;
  /** End-User's preferred e-mail address */
  email?: string;
  /** True if the End-User's e-mail address has been verified; otherwise false. */
  email_verified?: boolean;
  /** End-User's gender. Values defined by this specification are female and male. */
  gender?: string;
  /** End-User's birthday, represented as an ISO 8601:2004 [ISO8601‑2004] YYYY-MM-DD format */
  birthdate?: string;
  /** String from zoneinfo [zoneinfo] time zone database representing the End-User's time zone. */
  zoneinfo?: string;
  /** End-User's locale, represented as a BCP47 [RFC5646] language tag. */
  locale?: string;
  /** End-User's preferred telephone number. */
  phone_number?: string;
  /** True if the End-User's phone number has been verified; otherwise false. */
  phone_number_verified?: boolean;
  /** object 	End-User's preferred address in JSON [RFC4627] */
  address?: OidcAddress;
  /** Time the End-User's information was last updated. */
  updated_at?: number;
}

interface OidcAddress {
  /** Full mailing address, formatted for display or use on a mailing label */
  formatted?: string;
  /** Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information */
  street_address?: string;
  /** City or locality component */
  locality?: string;
  /** State, province, prefecture, or region component */
  region?: string;
  /** Zip code or postal code component */
  postal_code?: string;
  /** Country name component */
  country?: string;
}

/*export interface IdentityProfile {
    domainuser: string,
    email: string,
    givenname: string,
    surname: string,
    sub: string
}*/

const userManager = new oidc.UserManager({
  authority: AppConfig.identityProvider.authority,
  client_id: AppConfig.identityProvider.clientId,
  redirect_uri: AppConfig.identityProvider.redirectUri,
  response_type: "code",
  scope: AppConfig.identityProvider.scope,
  revokeAccessTokenOnSignout: true,
  post_logout_redirect_uri: AppConfig.identityProvider.logoutRedirectUri,
});

export async function signinRedirect() {
  localStorage.setItem("mylac-redirect", window.location.href);
  await userManager.signinRedirect();
}

export async function signinCallback() {
  await new oidc.UserManager({
    response_mode: "query",
  }).signinRedirectCallback();
}

export async function signoutRedirect() {
  await userManager.signoutRedirect();
}

// export async function logoutCallback() {
//     const response = await userManager.signoutRedirectCallback()
//     if (response && response.state) {
//         location.href = response.state
//     }
// }

export async function getUser(): Promise<IdentityUser> {
  //console.log('calling getUser');
  var userInfo = await userManager.getUser();
  //console.log(userInfo);
  if (userInfo == null) {
    try {
      const account = localStorage.getItem("oidcUserAccount");
     // console.log('sync user account');
     // console.log(account);
      if (account != null) {
        let userAccount = JSON.parse(account);
        //console.log('parse user account');
        //console.log(userAccount);
        userInfo = {
          access_token: userAccount.access_token,
          id_token: userAccount.id_token,
          token_type: userAccount.token_type,
          session_state: userAccount.session_state,
          scope: userAccount.scope,
          profile: userAccount.profile,
          expires_at: userAccount.expires_at,
        } as oidc.User;
        //console.log("new User Info from UCC log in");
        //console.log(userInfo);
      }
    } catch (e) {
      console.log("Error encountered in sync user account");
      console.log(e);
    }
  }
  return userInfo;
}
