import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DialogConfiguration } from 'src/app/shared/components/dialog/dialog-configuration.class';
import { DialogContent } from 'src/app/shared/components/dialog/dialog-content.class';
import { DragDropDirective } from 'src/app/shared/directives/dragdrop.directive';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ArrayUtils } from 'src/app/shared/utils/array.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { Note } from 'src/app/story-manager/models/note.interface';
import { StoryManagerGoogleDriveService } from 'src/app/story-manager/services/story-manager-google-drive.service';

@Component({
  selector: 'app-note-tag-manager',
  standalone: true,
  imports: [
    CommonModule,
    DragDropDirective
  ],
  templateUrl: './note-tag-manager.component.html',
  styleUrls: ['./note-tag-manager.component.scss']
})
export class NoteTagManagerComponent extends DialogContent<string[]> implements OnInit {

  @Input() note: Note;

  protected currentTags: string[];
  protected availableTags: string[];

  public configuration: DialogConfiguration = {
    title: 'Tag Manager',
    buttons: [{
      text: () => 'Cancel',
      click: () => this.close()
    }, {
      text: () => 'Save',
      click: () => this.submit()
    }]
  };

  constructor(
    private dialogService: DialogService,
    private googleService: StoryManagerGoogleDriveService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.note.tags) {
      this.currentTags = this.note.tags.slice();
    } else {
      this.currentTags = [];
    }

    this.availableTags = this.note.parent.noteTags.filter(tag => !this.currentTags.includes(tag));
  }

  protected add(tag: string): void {
    this.currentTags.push(tag);
    ArrayUtils.remove(this.availableTags, tag);

  }

  protected remove(tag: string): void {
    ArrayUtils.remove(this.currentTags, tag);
    this.availableTags.push(tag);
    this.availableTags.sort((t1, t2) => t1.localeCompare(t2));
  }

  protected editTag(tag?: string): void {
    this.dialogService.createInput('Tag', 'Tag Title', tag, 'OK').then(result => {
      if (!StringUtils.isEmpty(result)) {
        if (this.note.parent.noteTags.includes(result)) return;
        if (tag) {
          if (result != tag) {
            if (this.currentTags.includes(tag)) {
              ArrayUtils.remove(this.currentTags, tag);
              this.currentTags.push(result);
              this.currentTags.sort((t1, t2) => t1.localeCompare(t2));
            } else {
              ArrayUtils.remove(this.availableTags, tag);
              this.availableTags.push(result);
              this.availableTags.sort((t1, t2) => t1.localeCompare(t2));
            }

            ArrayUtils.remove(this.note.parent.noteTags, tag);
            this.note.parent.noteTags.push(result);
            this.note.parent.noteTags.sort((t1, t2) => t1.localeCompare(t2));
          }
        } else {
          this.availableTags.push(result);
          this.availableTags.sort((t1, t2) => t1.localeCompare(t2));
          this.note.parent.noteTags.push(result);
          this.note.parent.noteTags.sort((t1, t2) => t1.localeCompare(t2));
        }

        this.googleService.update(true);
      }
    });
  }

  protected deleteTag(tag: string): void {
    this.dialogService.createConfirmation('Delete', ['Are you sure you want to delete "' + tag + '"?'], 'Yes', 'No').then(result => {
      if (result) {
        if (this.currentTags.includes(tag)) {
          ArrayUtils.remove(this.currentTags, tag);
        } else {
          ArrayUtils.remove(this.availableTags, tag);
        }

        this.note.parent.notes.forEach(note => ArrayUtils.remove(note.tags, tag));
        ArrayUtils.remove(this.note.parent.noteTags, tag);
        this.googleService.update(true);
      }
    });
  }

  @HostListener('window:keydown.enter', ['$event'])
  submit(): void {
    this.resolve(this.currentTags);
  }

  @HostListener('window:keydown.escape', ['$event'])
  public close(): void {
    this.resolve(null);
  }

}