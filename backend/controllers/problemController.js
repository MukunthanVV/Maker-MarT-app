import { demoProblems } from '../data/problemsData.js';

export const getProblems = async (req, res, next) => {
    try {
        const { category } = req.query;
        let problems = demoProblems;
        
        // Match the frontend slicing logic to simulate DB categories
        if (category === 'SIH') {
            problems = demoProblems.slice(0, 7);
        } else if (category === 'India Innovate') {
            problems = demoProblems.slice(7, 14);
        } else if (category === 'Startup India') {
            problems = demoProblems.slice(14, 20);
        }
        
        res.status(200).json(problems);
    } catch (error) {
        next(error);
    }
};
