"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const configuration_error_1 = require("./configuration-error");
const fetch_1 = require("./fetch");
class GithubAPI {
    constructor(config) {
        this.cacheDir = config.cacheDir && path.join(config.rootPath, config.cacheDir, "github");
        this.auth = this.getAuthToken();
        this.strictSSL = !!config.githubServerStrictSSL;
        if (!this.auth) {
            throw new configuration_error_1.default("Must provide GITHUB_AUTH");
        }
    }
    getBaseIssueUrl(repo, githubServer) {
        return `https://${githubServer}/${repo}/issues/`;
    }
    getIssueData(repo, issue, githubServer) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._fetch(`https://api.${githubServer}/repos/${repo}/issues/${issue}`);
        });
    }
    getUserData(login, githubServer) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._fetch(`https://api.${githubServer}/users/${login}`);
        });
    }
    _fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch_1.default(url, {
                cacheManager: this.cacheDir,
                headers: {
                    Authorization: `token ${this.auth}`,
                },
                strictSSL: this.strictSSL,
            });
            const parsedResponse = yield res.json();
            if (res.ok) {
                return parsedResponse;
            }
            throw new configuration_error_1.default(`Fetch error: ${res.statusText}.\n${JSON.stringify(parsedResponse)}`);
        });
    }
    getAuthToken() {
        return process.env.GITHUB_AUTH || "";
    }
}
exports.default = GithubAPI;
