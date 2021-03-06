/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { items } from '@microsoft.azure/codegen';
import { ImportDirective, Namespace } from '@microsoft.azure/codegen-csharp';
import { Schema, ClientRuntime } from '@microsoft.azure/autorest.csharp-v2';
import { State } from '../state';
import { CmdletClass } from '../cmdlet-class';

export class CmdletNamespace extends Namespace {
  inputModels = new Array<Schema>();
  public get outputFolder(): string {
    return this.state.project.cmdletFolder;
  }

  constructor(parent: Namespace, private state: State, objectInitializer?: Partial<CmdletNamespace>) {
    super('Cmdlets', parent);
    this.apply(objectInitializer);
  }

  async init() {
    this.add(new ImportDirective(`static ${ClientRuntime.Extensions}`));

    // generate cmdlet classes on top of the SDK
    for (const { key: index, value: operation } of items(this.state.model.commands.operations)) {
      this.addClass(await new CmdletClass(this, operation, this.state.path('commands', 'operations', index)).init());

      for (const p of operation.parameters) {
        this.state.project.modelCmdlets.addInputSchema(<Schema>p.schema);
      }
    }
    return this;
  }
}