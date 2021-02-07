const path = require("path");

import ConfigurationError from "./configuration-error";
import fetch from "./fetch";

export interface GitHubUserResponse {
  login: string;
  name: string;
  html_url: string;
}

export interface GitHubIssueResponse {
  number: number;
  title: string;
  pull_request?: {
    html_url: string;
  };
  labels: Array<{
    name: string;
  }>;
  user: {
    login: string;
    html_url: string;
  };
}

export interface Options {
  repo: string;
  rootPath: string;
  cacheDir?: string;
}

export default class GithubAPI {
  private cacheDir: string | undefined;
  private auth: string;

  constructor(config: Options) {
    this.cacheDir = config.cacheDir && path.join(config.rootPath, config.cacheDir, "github");
    this.auth = this.getAuthToken();
    if (!this.auth) {
      throw new ConfigurationError("Must provide GITHUB_AUTH");
    }
  }

  public getBaseIssueUrl(repo: string, githubServer: string): string {
    return `https://${this.getGithubServer(githubServer)}/${repo}/issues/`;
  }

  public async getIssueData(repo: string, issue: string, githubServer: string): Promise<GitHubIssueResponse> {
    return this._fetch(`https://api.${this.getGithubServer(githubServer)}/repos/${repo}/issues/${issue}`);
  }

  public async getUserData(login: string, githubServer: string): Promise<GitHubUserResponse> {
    return this._fetch(`https://api.${this.getGithubServer(githubServer)}/users/${login}`);
  }

  private getGithubServer(githubServer: string) {
    // if (!githubServer) {
    //   return 'github.com';
    // }

    return githubServer;
  }

  private async _fetch(url: string): Promise<any> {
    const res = await fetch(url, {
      cacheManager: this.cacheDir,
      headers: {
        Authorization: `token ${this.auth}`,
      },
    });
    const parsedResponse = await res.json();
    if (res.ok) {
      return parsedResponse;
    }
    throw new ConfigurationError(`Fetch error: ${res.statusText}.\n${JSON.stringify(parsedResponse)}`);
  }

  private getAuthToken(): string {
    return process.env.GITHUB_AUTH || "";
  }
}
