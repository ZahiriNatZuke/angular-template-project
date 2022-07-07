import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hideSelected', pure: false })
export class HideSelectedPipe implements PipeTransform {

  transform(value: any[], selected: any[]): any[] {
    const selectedID: string[] = selected.map((e: any) => e.id);
    return value.filter(e => selectedID.indexOf(e.id) === -1) ?? value;
  }

}
