import { GoogleMetadata } from "src/app/shared/classes/google-api/google-metadata.class";
import { GalleryGroup } from "./gallery-group.class";

export class GalleryImage extends GoogleMetadata {

  public heart: boolean;
  public bookmark: boolean;
  public archive: boolean;
  public tags: string[];
  public likes: number;

  // transient props
  public top: number;
  public left: number;
  public width: number;
  public height: number;
  public aspectRatio: number;
  public contentLink: string;
  public group: GalleryGroup;
  public passesFilter: boolean;

}
