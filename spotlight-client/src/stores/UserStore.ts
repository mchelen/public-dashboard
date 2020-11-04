// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================

import { Auth0Client, Auth0ClientOptions } from "@auth0/auth0-spa-js";
import { makeAutoObservable, runInAction } from "mobx";
import qs from "qs";
import RootStore from "./RootStore";

type ConstructorProps = {
  authSettings?: Auth0ClientOptions;
  isAuthRequired: boolean;
  rootStore?: RootStore;
};

/**
 * Reactive wrapper around Auth0 client.
 * If auth is disabled for this environment, all users will be immediately authorized.
 * Otherwise, call `authorize` to retrieve credentials or start login flow.
 *
 * @example
 *
 * ```js
 * const store = new UserStore({ isAuthRequired: true, authSettings: { domain, client_id, redirect_uri } });
 * if (!store.isAuthorized) {
 *   await store.authorize();
 *   // this may trigger a redirect to the Auth0 login domain;
 *   // if we're still here and user has successfully logged in,
 *   // store.isAuthorized should now be true.
 * }
 * ```
 */
export default class UserStore {
  authSettings?: Auth0ClientOptions;

  awaitingVerification: boolean;

  isAuthorized: boolean;

  isLoading: boolean;

  rootStore?: RootStore;

  constructor({ authSettings, isAuthRequired, rootStore }: ConstructorProps) {
    makeAutoObservable(this);

    this.authSettings = authSettings;
    this.rootStore = rootStore;

    this.awaitingVerification = false;
    if (!isAuthRequired) {
      this.isAuthorized = true;
      this.isLoading = false;
    } else {
      this.isAuthorized = false;
      this.isLoading = true;
    }
  }

  /**
   * If user already has a valid Auth0 credential, this method will retrieve it
   * and update class properties accordingly. If not, user will be redirected
   * to the Auth0 login domain for fresh authentication.
   */
  async authorize(): Promise<void> {
    if (!this.authSettings) {
      throw new Error("no Auth0 configuration found");
    }
    const auth0 = new Auth0Client(this.authSettings);

    const urlQuery = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    if (urlQuery.code && urlQuery.state) {
      await auth0.handleRedirectCallback();
      // auth0 params are single-use, must be removed or they'll cause errors
      const newUrl = new URL(window.location.href);
      delete urlQuery.code;
      delete urlQuery.state;
      newUrl.search = qs.stringify(urlQuery, { addQueryPrefix: true });
      window.history.replaceState({}, document.title, newUrl.href);
    }

    if (await auth0.isAuthenticated()) {
      const user = await auth0.getUser();
      runInAction(() => {
        this.isLoading = false;
        if (user.email_verified) {
          this.isAuthorized = true;
          this.awaitingVerification = false;
        } else {
          this.isAuthorized = false;
          this.awaitingVerification = true;
        }
      });
    } else {
      auth0.loginWithRedirect();
    }
  }
}