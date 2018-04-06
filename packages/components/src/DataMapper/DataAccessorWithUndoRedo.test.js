import * as TestData from './TestData';
import * as Constants from './Constants';
import DefaultDataAccessor from './DefaultDataAccessor';
import DataAccessorWithUndoRedo from './DataAccessorWithUndoRedo';

const dataAccessor = new DataAccessorWithUndoRedo(new DefaultDataAccessor());

it('data-accessor-with-undo-redo', () => {

  const inputSchema = TestData.schema1;
  dataAccessor.populateCache(inputSchema, Constants.MappingSide.INPUT);
  const outputSchema = TestData.schema2;
  dataAccessor.populateCache(outputSchema, Constants.MappingSide.OUTPUT);

  let mapping = TestData.mapping;

  expect(dataAccessor.canUndo()).toBe(false);
  expect(dataAccessor.canRedo()).toBe(false);

  mapping = dataAccessor.addMapping(mapping, TestData.element3, TestData.element7);
  expect(dataAccessor.canUndo()).toBe(true);
  expect(dataAccessor.canRedo()).toBe(false);

  expect(dataAccessor.getUndoLabel())
    .toBe(`Undo "Map ${TestData.element3.name} to ${TestData.element7.name}"`);

  let cmd = dataAccessor.getACopyOfUndoCommand();
  expect(cmd.code).toBe(Constants.Commands.ADD_MAPPING);
  let source = dataAccessor.getSchemaElementFromId(inputSchema, cmd.sourceId);
  expect(dataAccessor.areEquals(source, TestData.element3)).toBe(true);
  let target = dataAccessor.getSchemaElementFromId(outputSchema, cmd.targetId);
  expect(dataAccessor.areEquals(target, TestData.element7)).toBe(true);

  mapping = dataAccessor.undo(mapping);
  expect(dataAccessor.canUndo()).toBe(false);
  expect(dataAccessor.canRedo()).toBe(true);

  expect(dataAccessor.getRedoLabel())
    .toBe(`Redo "Map ${TestData.element3.name} to ${TestData.element7.name}"`);

  cmd = dataAccessor.getACopyOfRedoCommand();
  expect(cmd.code).toBe(Constants.Commands.ADD_MAPPING);

  mapping = dataAccessor.redo(mapping);
  expect(dataAccessor.canUndo()).toBe(true);
  expect(dataAccessor.canRedo()).toBe(false);

  mapping = dataAccessor.removeMapping(mapping, TestData.element3, TestData.element7);
  expect(dataAccessor.canUndo()).toBe(true);
  expect(dataAccessor.canRedo()).toBe(false);

  expect(dataAccessor.getUndoLabel())
    .toBe(`Undo "Clear mapping between ${TestData.element3.name} and ${TestData.element7.name}"`);

  cmd = dataAccessor.getACopyOfUndoCommand();
  expect(cmd.code).toBe(Constants.Commands.REMOVE_MAPPING);
  source = dataAccessor.getSchemaElementFromId(inputSchema, cmd.sourceId);
  expect(dataAccessor.areEquals(source, TestData.element3)).toBe(true);
  target = dataAccessor.getSchemaElementFromId(outputSchema, cmd.targetId);
  expect(dataAccessor.areEquals(target, TestData.element7)).toBe(true);

  mapping = dataAccessor.undo(mapping);
  expect(dataAccessor.canUndo()).toBe(true);
  expect(dataAccessor.canRedo()).toBe(true);

  cmd = dataAccessor.getACopyOfUndoCommand();
  expect(cmd.code).toBe(Constants.Commands.ADD_MAPPING);
  cmd = dataAccessor.getACopyOfRedoCommand();
  expect(cmd.code).toBe(Constants.Commands.REMOVE_MAPPING);

  mapping = dataAccessor.clearMapping(mapping);
  expect(dataAccessor.canUndo()).toBe(true);
  expect(dataAccessor.canRedo()).toBe(false);

  expect(dataAccessor.getUndoLabel()).toBe('Undo "Clear all mapping"');

  expect(dataAccessor.isMappingEmpty(mapping)).toBe(true);

  cmd = dataAccessor.getACopyOfUndoCommand();
  expect(cmd.code).toBe(Constants.Commands.CLEAR_MAPPING);

  const storedMapping = '[{"sourceId":"elem_2","targetId":"elem_5"},{"sourceId":"elem_4","targetId":"elem_8"},{"sourceId":"elem_3","targetId":"elem_7"}]';
  expect(JSON.stringify(cmd.storedMapping)).toBe(storedMapping);

  mapping = dataAccessor.undo(mapping);
  expect(dataAccessor.canUndo()).toBe(true);
  expect(dataAccessor.canRedo()).toBe(true);

  expect(dataAccessor.isMappingEmpty(mapping)).toBe(false);

  const mappingItems = dataAccessor.getMappingItems(mapping);
  expect(mappingItems.length).toBe(3);

  cmd = dataAccessor.getACopyOfRedoCommand();
  expect(cmd.code).toBe(Constants.Commands.CLEAR_MAPPING);

});
