import Button from '../../../../admin-x-ds/global/Button';
import Heading from '../../../../admin-x-ds/global/Heading';
import List from '../../../../admin-x-ds/global/List';
import ListItem from '../../../../admin-x-ds/global/ListItem';
import NiceModal from '@ebay/nice-modal-react';
import React, {ReactNode, useState, useEffect} from 'react';
import {ConfirmationModalContent} from '../../../../admin-x-ds/global/modal/ConfirmationModal';
import {ThemeProblem} from '../../../../api/themes';

type FatalError = {
    details: {
      errors: ThemeProblem[];
    };
  };

  type FatalErrors = FatalError[];

export const ThemeProblemView = ({problem}:{problem: ThemeProblem}) => {
    const [isExpanded, setExpanded] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const handleClick = () => {
        setExpanded(!isExpanded);
    };

    useEffect(() => {
        // Set up a listener for changes in the color scheme
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Initial setup
        setIsDarkMode(darkModeMediaQuery.matches);

        // Handle color scheme changes
        const handleColorSchemeChange = (event: MediaQueryListEvent) => {
            setIsDarkMode(event.matches);
        };

        darkModeMediaQuery.addListener(handleColorSchemeChange);

        // Clean up the listener when the component is unmounted
        return () => {
            darkModeMediaQuery.removeListener(handleColorSchemeChange);
        };
    }, []); 


    return <ListItem
        title={
            <>
                <div className={`${problem.level === 'error' ? 'before:bg-red' : 'before:bg-yellow'} relative px-4 text-sm before:absolute before:left-0 before:top-1.5 before:block before:h-2 before:w-2 before:rounded-full before:content-['']`}>
                    {
                        problem?.fatal ?
                            <strong>Fatal: </strong>
                            :
                            <strong>{problem.level === 'error' ? 'Error: ' : 'Warning: '}</strong>
                    }
                    <span dangerouslySetInnerHTML={{__html: problem.rule}} />
                    <div className='absolute -right-4 top-1'>
                        <Button color="green" icon={isExpanded ? 'chevron-down' : 'chevron-right'} iconColorClass='text-grey-700' size='sm' link onClick={() => handleClick()} />
                    </div>
                </div>
                {
                    isExpanded ?
                        <div className='mt-2 px-4 text-[13px] leading-8'>
                            <div dangerouslySetInnerHTML={{__html: problem.details}} className='mb-4' />
                            <Heading level={6}>Affected files:</Heading>
                            <ul className={`mt-1 ${isDarkMode? 'text-white' : ''}`}>
                                {problem.failures.map(failure => <li><code>{failure.ref}</code>{failure.message ? `: ${failure.message}` : ''}</li>)}
                            </ul>
                        </div> :
                        null
                }
            </>
        }
        hideActions
        separator
    />;
};

const InvalidThemeModal: React.FC<{
    title: string
    prompt: ReactNode
    fatalErrors?: FatalErrors;
    onRetry?: (modal?: {
        remove: () => void;
    }) => void | Promise<void>;
}> = ({title, prompt, fatalErrors, onRetry}) => {
    let warningPrompt = null;
    if (fatalErrors) {
        warningPrompt = <div className="mt-10">
            <List title="Errors">
                {fatalErrors?.map((error: any) => error?.details?.errors?.map((err: any) => <ThemeProblemView problem={err} />
                ))}
            </List>
        </div>;
    }

    return <ConfirmationModalContent
        cancelLabel='Close'
        okColor='black'
        okLabel={'Retry'}
        prompt={<>
            {prompt}
            {warningPrompt}
        </>}
        title={title}
        onOk={onRetry}
    />;
};

export default NiceModal.create(InvalidThemeModal);
