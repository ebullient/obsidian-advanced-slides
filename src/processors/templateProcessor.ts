import { CommentParser } from 'src/comment';
import { ObsidianUtils } from 'src/obsidianUtils';
import { Options } from 'src/options';
import { FootnoteProcessor } from './footNoteProcessor';
import { MultipleFileProcessor } from './multipleFileProcessor';

export class TemplateProcessor {

	private multipleFileProcessor: MultipleFileProcessor;
	private footnoteProcessor: FootnoteProcessor;

	private emptySlideCommentRegex = /<!--\s*(?:\.)?slide(?::)?\s*-->/g;
	private templateCommentRegex = /<!--\s*(?:\.)?slide.*(template="\[\[([^\]]+)\]\]"\s*).*-->/;
	private propertyRegex = /:::\s([^\n]+)\s*(.*?:::[^\n]*)/sg;

	private optionalRegex = /<%\?.*%>/g;

	private utils: ObsidianUtils;
	private parser = new CommentParser();

	constructor(utils: ObsidianUtils) {
		this.utils = utils;
		this.multipleFileProcessor = new MultipleFileProcessor(utils);
		this.footnoteProcessor = new FootnoteProcessor();
	}

	process(markdown: string, options: Options) {
		let output = markdown;

		markdown
			.split(new RegExp(options.separator, 'gmi'))
			.map(slidegroup => {
				return slidegroup
					.split(new RegExp(options.verticalSeparator, 'gmi'))
					.map(slide => {

						let newSlide = slide;
						if (this.templateCommentRegex.test(slide)) {
							try {
								while (this.templateCommentRegex.test(newSlide)) {
									newSlide = this.transformSlide(newSlide);
								}
								newSlide = newSlide.replaceAll(this.emptySlideCommentRegex, '');
								newSlide = this.computeVariables(newSlide);
								output = output.split(slide).join(newSlide);
								return newSlide;
							} catch (error) {
								console.log('Cannot process template: ' + error);
								return slide;
							}

						}
						return slide;
					})
					.join(options.verticalSeparator);
			})
			.join(options.separator);
		return output;
	}

	transformSlide(slide: string) {
		if (this.templateCommentRegex.test(slide)) {
			const [, templateProperty, file] = this.templateCommentRegex.exec(slide);
			let fileWithExtension = file;
			if (!fileWithExtension.endsWith('.md')) {
				fileWithExtension = fileWithExtension + '.md';
			}
			let templateContent = this.utils.parseFile(fileWithExtension, null);
			templateContent = this.multipleFileProcessor.process(templateContent);
			templateContent = templateContent.replaceAll('<% content %>', slide.replaceAll(templateProperty, ''));
			return templateContent;
		} else {
			return slide;
		}
	}

	computeVariables(slide: string): string {

		let result = slide;
		this.propertyRegex.lastIndex = 0;

		let m;
		while ((m = this.propertyRegex.exec(slide)) !== null) {
			if (m.index === this.propertyRegex.lastIndex) {
				this.propertyRegex.lastIndex++;
			}

			// eslint-disable-next-line prefer-const
			let [match, name, content] = m;

			if (name == 'block') continue;

			content = '::: block\n' + content;
			const optionalName = '<%? ' + name.trim() + ' %>';
			name = '<% ' + name.trim() + ' %>';
			result = result.replaceAll(optionalName, content + '\n' + optionalName);
			result = result.replaceAll(name, content);
			result = result.replaceAll(match, '');
		}
		result = this.footnoteProcessor.transformFootNotes(result);
		//Remove optional template variables
		while ((m = this.optionalRegex.exec(result)) !== null) {
			if (m.index === this.optionalRegex.lastIndex) {
				this.optionalRegex.lastIndex++;
			}
			result = result.replaceAll(m[0], '');
		}
		return result;
	}
}
