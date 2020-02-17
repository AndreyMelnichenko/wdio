import { URL } from "url";
import { CitationTracker } from "./citationTracker.page";

class CitationTool extends CitationTracker {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/tool`);
  public elementLocator: string = "//*[text()='Add Report']";
}

export { CitationTool };
