import { ObsidianUtils } from 'src/obsidian/obsidianUtils';
import { anyString, anything, instance, mock, when } from 'ts-mockito';

export const MockedObsidianUtils = mock(ObsidianUtils);

when(MockedObsidianUtils.getAbsolutePath(anyString())).thenCall(arg => {
	throw new Error('ObsidianUtils.getAbsolutePath->Parameter not mocked: ' + arg);
});

when(MockedObsidianUtils.findImageFile(anyString())).thenCall(arg => {
	throw new Error('ObsidianUtils.findImageFile->Parameter not mocked: ' + arg);
});

when(MockedObsidianUtils.parseFile(anyString(), anything())).thenCall((arg1, arg2) => {
	throw new Error('ObsidianUtils.parseFile->Parameter not mocked: ' + arg1 + ' - ' + arg2);
});

when(MockedObsidianUtils.vaultName).thenReturn('test-vault');

when(MockedObsidianUtils.findFile('template.md')).thenReturn('templateMock');

when(MockedObsidianUtils.absolute('templateMock')).thenReturn('template');

when(MockedObsidianUtils.parseFile('template', anything())).thenCall(arg => {
	throw new Error('ObsidianUtils.parseFile->Parameter not mocked: ' + arg);
});

export const obsidianUtils: ObsidianUtils = instance(MockedObsidianUtils);
