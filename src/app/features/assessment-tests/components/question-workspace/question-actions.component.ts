import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'ngx-question-actions',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="question-actions__question-actions">
      <button
        mat-icon-button
        aria-label="Move question up"
        title="Move question up"
        [disabled]="selectedIndex() === 0"
        (click)="move.emit(-1)"
      >
        <mat-icon>arrow_upward</mat-icon></button
      ><button
        mat-icon-button
        aria-label="Move question down"
        title="Move question down"
        [disabled]="selectedIndex() === count() - 1"
        (click)="move.emit(1)"
      >
        <mat-icon>arrow_downward</mat-icon></button
      ><button
        mat-icon-button
        aria-label="Move question to position"
        title="Move to a specific position"
        (click)="openMove.emit()"
      >
        <mat-icon>swap_vert</mat-icon></button
      ><button
        mat-icon-button
        aria-label="Duplicate question"
        title="Duplicate question"
        (click)="duplicate.emit()"
      >
        <mat-icon>content_copy</mat-icon></button
      ><button
        mat-icon-button
        aria-label="Remove selected question"
        title="Remove question (undo available)"
        [disabled]="count() === 1"
        (click)="remove.emit()"
      >
        <mat-icon>delete_outline</mat-icon>
      </button>
    </div>
    @if (moveOpen()) {
      <div class="question-actions__move-controls">
        <mat-form-field appearance="outline"
          ><mat-label>Move to position</mat-label
          ><input
            matInput
            type="number"
            min="1"
            [max]="count()"
            [value]="moveTarget()"
            (input)="targetChange.emit(+$any($event.target).value)"
          /><mat-hint>1–{{ count() }}</mat-hint></mat-form-field
        ><button
          mat-flat-button
          [disabled]="!validMove()"
          (click)="moveTo.emit()"
        >
          Move</button
        ><button mat-button (click)="cancelMove.emit()">
          Cancel
        </button>
      </div>
    }
  `,
  styles: [
    `
      :host {
        --line: var(--mat-sys-outline-variant);
        --muted: var(--mat-sys-on-surface-variant);
        display: contents;
        min-width: 0;
      }
      .question-actions__question-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
      }
      .question-actions__question-actions {
        gap: 0;
      }
      button:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
      .question-actions__move-controls {
        flex-basis: 100%;
        display: flex;
        gap: 0.5rem;
        align-items: baseline;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .question-actions__move-controls mat-form-field {
        width: 140px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionActionsComponent {
  readonly selectedIndex = input.required<number>();
  readonly count = input.required<number>();
  readonly moveOpen = input.required<boolean>();
  readonly moveTarget = input.required<number>();
  readonly validMove = input.required<boolean>();
  readonly move = output<number>();
  readonly openMove = output<void>();
  readonly duplicate = output<void>();
  readonly remove = output<void>();
  readonly moveTo = output<void>();
  readonly targetChange = output<number>();
  readonly cancelMove = output<void>();
}
