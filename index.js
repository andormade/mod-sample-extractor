#!/usr/bin/env node
/**
 * parse_mod.js
 *
 * This script reads a MOD file, parses the header and sample descriptors,
 * and then extracts the PCM sample data from the file.
 */

const fs = require('fs');

if (process.argv.length < 3) {
	console.error("Usage: node parse_mod.js <mod_file>");
	process.exit(1);
}

const modFile = process.argv[2];

try {
	const buffer = fs.readFileSync(modFile);

	// Header parsing
	// First 20 bytes: song title
	const title = buffer.toString('ascii', 0, 20).trim();
	console.log(`Title: ${title}`);

	let offset = 20;
	const samples = [];

	// Next 31 * 30 bytes: sample descriptors.
	// Each sample descriptor is 30 bytes:
	// - 22 bytes: sample name
	// - 2 bytes: sample length (in 16-bit words; multiply by 2 for bytes)
	// - 1 byte: finetune value
	// - 1 byte: volume
	// - 2 bytes: loop start (in 16-bit words)
	// - 2 bytes: loop length (in 16-bit words)
	for (let i = 0; i < 31; i++) {
		const sampleName = buffer.toString('ascii', offset, offset + 22).trim();
		const sampleLength = buffer.readUInt16BE(offset + 22) * 2; // bytes
		const finetune = buffer.readUInt8(offset + 24);
		const volume = buffer.readUInt8(offset + 25);
		const loopStart = buffer.readUInt16BE(offset + 26) * 2; // bytes
		const loopLength = buffer.readUInt16BE(offset + 28) * 2; // bytes

		samples.push({
			name: sampleName,
			length: sampleLength,
			finetune: finetune,
			volume: volume,
			loopStart: loopStart,
			loopLength: loopLength
		});

		offset += 30;
	}

	// Next 1 byte: song length (number of pattern positions used)
	const songLength = buffer.readUInt8(offset);
	offset++;

	// Next 1 byte: restart position (unused here)
	const restartPosition = buffer.readUInt8(offset);
	offset++;

	// Next 128 bytes: pattern order table
	const patternOrder = [];
	for (let i = 0; i < 128; i++) {
		patternOrder.push(buffer.readUInt8(offset));
		offset++;
	}

	// Next 4 bytes: identifier (e.g., "M.K." indicates a 4-channel MOD)
	const identifier = buffer.toString('ascii', offset, offset + 4);
	offset += 4;
	console.log(`Identifier: ${identifier}`);

	// Determine the number of patterns:
	// The highest pattern number in the order table (up to songLength) + 1 gives the count.
	const numPatterns = Math.max(...patternOrder.slice(0, songLength)) + 1;
	console.log(`Number of Patterns: ${numPatterns}`);

	// Skip pattern data.
	// Each pattern: 64 rows * 4 channels * 4 bytes per note = 1024 bytes per pattern.
	const patternDataSize = numPatterns * 1024;
	offset += patternDataSize;

	console.log("Extracting PCM samples...");
	let sampleDataOffset = offset;
	samples.forEach((sample, index) => {
		if (sample.length > 0) {
			sample.data = buffer.slice(sampleDataOffset, sampleDataOffset + sample.length);
			sampleDataOffset += sample.length;
			console.log(`Sample ${index + 1}: "${sample.name}" - ${sample.length} bytes, Volume: ${sample.volume}`);

			const safeName = sample.name.replace(/[^a-z0-9]/gi, '_') || `sample${index + 1}`;
			const outFileName = `sample_${index + 1}_${safeName}.pcm`;
			fs.writeFileSync(outFileName, sample.data);
			console.log(`-> Written to ${outFileName}`);
		} else {
			console.log(`Sample ${index + 1}: "${sample.name}" has no data.`);
		}
	});
} catch (err) {
	console.error("Error processing MOD file:", err.message);
	process.exit(1);
}