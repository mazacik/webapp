import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { nanoid } from 'nanoid';
import { TagGroup } from 'src/app/gallery/model/tag-group.interface';
import { Tag } from 'src/app/gallery/model/tag.interface';
import { DialogConfiguration } from 'src/app/shared/components/dialog/dialog-configuration.class';
import { DialogContent } from 'src/app/shared/components/dialog/dialog-content.class';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ArrayUtils } from 'src/app/shared/utils/array.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { GalleryStateService } from '../../services/gallery-state.service';
import { GalleryTagGroupEditorComponent } from '../gallery-tag-group-editor/gallery-tag-group-editor.component';

@Component({
  selector: 'app-gallery-tag-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './gallery-tag-editor.component.html',
  styleUrls: ['./gallery-tag-editor.component.scss'],
})
export class GalleryTagEditorComponent extends DialogContent<Tag> implements OnInit {

  @Input() protected group: TagGroup;
  @Input() protected tag: Tag;

  protected currentGroup: TagGroup;

  protected tagName: string;

  protected canDelete: boolean;

  public configuration: DialogConfiguration = {
    title: 'Tag Editor',
    buttons: [{
      text: () => this.group ? 'Save' : 'Create',
      disabled: () => !this.canSubmit(),
      click: () => this.submit()
    }, {
      text: () => 'Cancel',
      click: () => this.close()
    }, {
      text: () => 'Delete',
      hidden: () => !this.canDelete,
      click: () => this.deleteTag()
    }]
  };

  constructor(
    private dialogService: DialogService,
    protected stateService: GalleryStateService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.group) {
      this.currentGroup = this.group;
      this.canDelete = true;
    } else {
      this.currentGroup = { name: '', state: 0, tags: [] };
      this.canDelete = false;
    }

    if (!this.tag) this.tag = { id: nanoid(), name: '', state: 0 };
    this.tagName = this.tag.name;
  }

  protected editGroup(before?: TagGroup): void {
    this.dialogService.create(GalleryTagGroupEditorComponent, {
      group: before
    }).then(after => {
      if (after) {
        this.currentGroup.name = after.name;
      } else {
        if (before && !this.stateService.tagGroups.includes(before)) {
          this.resolve(null);
        }
      }
    });
  }

  protected deleteTag(): void {
    if (this.canDelete) {
      this.dialogService.createConfirmation('Delete Tag', ['Do you really want to delete tag "' + this.tag.name + '"?'], 'Yes', 'No').then(result => {
        if (result) {
          for (const image of this.stateService.images) {
            ArrayUtils.remove(image.tags, this.tag.id);
          }

          ArrayUtils.remove(this.group.tags, this.tag);

          this.stateService.updateData();
          this.resolve(null);
        }
      });
    }
  }

  protected canSubmit(): boolean {
    if (StringUtils.isEmpty(this.tagName)) {
      return false;
    }

    if (this.tagName == this.tag.name) {
      return true;
    }

    return this.currentGroup?.tags.find(tag => this.tagName == tag.name) == null;
  }

  @HostListener('window:keydown.enter', ['$event'])
  protected submit(): void {
    if (this.canSubmit()) {
      this.tag.name = this.tagName;

      if (this.group && this.group != this.currentGroup) {
        ArrayUtils.remove(this.group.tags, this.tag);
      }

      if (!this.currentGroup.tags.includes(this.tag)) {
        this.currentGroup.tags.push(this.tag);
        this.stateService.tagCounts[this.tag.id] = this.stateService.images.filter(image => image.tags.includes(this.tag.id)).length;
      }

      this.currentGroup.tags.sort((tag1, tag2) => tag1.name.localeCompare(tag2.name));
      this.stateService.updateData();
      this.resolve(this.tag);
    }
  }

  public close(): void {
    this.resolve(null);
  }

}
