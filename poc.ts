import puppeteer, {Page} from "puppeteer";
import { diffString,diff } from "json-diff";

interface SerializedDOM {
  identifyHint: string;
  children: SerializedDOM[];
  styles: Record<string, string>;
}

interface CompareeDOM {
  children: SerializedDOM[];
  styles: Record<string, string>;
}

const fn = () => {
    const dom2json = (element: Element): SerializedDOM => {
    const computed = window.getComputedStyle(element);
    const styles = Object.values(computed).reduce(
        (acc, prop) => ({
        ...acc,
        [prop]: computed.getPropertyValue(prop),
        }),
        {}
    );
    

    return {
        identifyHint: element.className,
        children: Array.from(element.children).map(dom2json),
        styles: styles,
    };
    };
    return dom2json(document.body);
    
}

const getComputedStyleJson = async (page: Page) => {
    return page.evaluate(fn);
};

puppeteer.launch().then(async browser => {
    try {
        const page1 = await browser.newPage();
        await page1.goto("http://localhost:5000/sample1");
        const dimensions1 = await getComputedStyleJson(page1);
        const page2 = await browser.newPage();
        await page2.goto("http://localhost:5000/sample2");
        const dimensions2 = await getComputedStyleJson(page2);
        console.log(JSON.stringify(diff(dimensions1, dimensions2)));
        // console.log(diffString(dimensions1, dimensions2));
    } catch (e) {
        console.log(e);
    } finally {
        browser.close();
    }
})

