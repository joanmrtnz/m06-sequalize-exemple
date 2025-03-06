/**
 * Script principal per validar els CSVs de YouTubers
 * Executa totes les validacions i mostra els resultats
 */

const { validateYoutuberData, verifyPaths } = require('./csvValidator');

async function main() {
    try {
        console.log('Verificant rutes d\'arxius...');
        await verifyPaths();

        console.log('\nIniciant validació de dades...');
        const results = await validateYoutuberData();
        
        console.log('\nResum de validació:');
        console.log(JSON.stringify(results.summary, null, 2));
        
        // Verificar si hi ha problemes
        if (!results.summary.structureValid || 
            !results.summary.referentialIntegrityValid ||
            results.summary.hasDuplicates ||
            results.summary.hasMissingData) {
            
            console.error('\n⚠️ S\'han trobat problemes a les dades');
            
            // Mostrar detalls dels problemes
            if (!results.summary.structureValid) {
                console.error('\n- Problemes d\'estructura a les taules:');
                for (const [table, data] of Object.entries(results.results.structure)) {
                    if (!data.columnsMatch) {
                        console.error(`  Taula ${table}:`);
                        if (data.missingColumns.length > 0) {
                            console.error('    Columnes que falten:', data.missingColumns);
                        }
                        if (data.extraColumns.length > 0) {
                            console.error('    Columnes extra:', data.extraColumns);
                        }
                    }
                }
            }
            
            if (!results.summary.referentialIntegrityValid) {
                console.error('\n- Problemes d\'integritat referencial:');
                const { referential } = results.results;
                if (referential.invalidProfiles.length > 0) {
                    console.error('    Perfils amb youtuber_id invàlid:', 
                        referential.invalidProfiles.map(p => p.id));
                }
                if (referential.invalidVideos.length > 0) {
                    console.error('    Videos amb youtuber_id invàlid:', 
                        referential.invalidVideos.map(v => v.id));
                }
                if (referential.invalidVideoCategories.length > 0) {
                    console.error('    Relacions video-categoria invàlides:', 
                        referential.invalidVideoCategories);
                }
            }
            
            if (results.summary.hasDuplicates) {
                console.error('\n- Registres duplicats:');
                const { duplicates } = results.results;
                if (Object.keys(duplicates.duplicateChannels).length > 0) {
                    console.error('    Canals duplicats:', duplicates.duplicateChannels);
                }
                if (Object.keys(duplicates.duplicateVideoCategories).length > 0) {
                    console.error('    Categories duplicades per video:', 
                        duplicates.duplicateVideoCategories);
                }
            }
            
            if (results.summary.hasMissingData) {
                console.error('\n- Dades obligatòries que falten:');
                const { missing } = results.results;
                if (missing.youtubersWithoutProfile.length > 0) {
                    console.error('    YouTubers sense perfil:', 
                        missing.youtubersWithoutProfile.map(y => y.id));
                }
                if (missing.videosWithoutCategories.length > 0) {
                    console.error('    Videos sense categories:', 
                        missing.videosWithoutCategories.map(v => v.id));
                }
            }
            
            process.exit(1);
        }
        
        console.log('\n✅ Totes les dades són vàlides');
        
    } catch (error) {
        console.error('Error durant la validació:', error);
        process.exit(1);
    }
}

main();