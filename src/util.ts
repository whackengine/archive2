export function assert(value: any, message: string = ""): void
{
    if (!value)
    {
        throw new Error(message);
    }
}

const INITIAL_CAPACITY = 3;

function assertNotFixedVectorError(value: boolean): void
{
    if (!value)
    {
        throw new RangeError("The fixed property is set to true.");
    }
}

export class FlexDoubleVector
{
    private m_array: Float64Array;
    private m_length: number = 0;
    private m_fixed: boolean;

    constructor(argument: number | Float64Array = 0, fixed: boolean = false)
    {
        if (typeof argument == "number")
        {
            argument = Math.max(0, argument >>> 0);
            this.m_array = new Float64Array(Math.max(INITIAL_CAPACITY, argument));
            this.m_length = argument;
        }
        else
        {
            if (argument.length == 0)
            {
                this.m_array = new Float64Array(INITIAL_CAPACITY);
                this.m_length = 0;
            } else {
                this.m_array = argument.slice(0);
                this.m_length = argument.length;
            }
        }
        this.m_fixed = fixed;
    }

    entries(): Iterator<[number, number]>
    {
        return this.m_array.subarray(0, this.m_length).entries();
    }

    keys(): Iterator<number>
    {
        return this.m_array.subarray(0, this.m_length).keys();
    }

    values(): Iterator<number>
    {
        return this.m_array.subarray(0, this.m_length).values();
    }

    get length(): number
    {
        return this.m_length;
    }

    set length(value: number)
    {
        value = Number(value);
        if (value == this.m_length)
        {
            return;
        }
        assertNotFixedVectorError(this.m_fixed);
        value = Math.max(0, value >>> 0);
        if (value > this.m_array.length)
        {
            const k = this.m_array;
            this.m_array = new Float64Array(k.length + (value - k.length));
            this.m_array.set(k.subarray(0, k.length));
            this.m_length = value;
        }
        else if (value == 0)
        {
            this.m_array = new Float64Array(INITIAL_CAPACITY);
            this.m_length = 0;
        }
        else
        {
            this.m_array = this.m_array.slice(0, value);
            this.m_length = value;
        }
    }

    get fixed(): boolean
    {
        return this.m_fixed;
    }

    set fixed(value: boolean)
    {
        this.m_fixed = !!value;
    }

    hasIndex(index: number): boolean
    {
        index = Math.max(0, index >>> 0);
        return index < this.m_length;
    }

    get(index: number): number
    {
        index = Math.max(0, index >>> 0);
        return index < this.m_length ? this.m_array[index] : 0;
    }

    /**
     * @throws {Error} If index is out of range.
     */
    set(index: number, value: number): void
    {
        index = Math.max(0, index >>> 0);
        value = Number(value);
        if (index == this.m_length)
        {
            assertNotFixedVectorError(this.m_fixed);
            this.push(value);
        }
        if (index >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        this.m_array[index] = value;
    }
    
    push(value: number): void
    {
        assertNotFixedVectorError(this.m_fixed);
        const i = this.m_length++;
        if (i >= this.m_array.length)
        {
            const k = this.m_array;
            this.m_array = new Float64Array(k.length * 2);
            this.m_array.set(k.subarray(0, i));
        }
        this.m_array[i] = Number(value);
    }

    pop(): number
    {
        assertNotFixedVectorError(this.m_fixed);
        return this.m_length == 0 ? 0 : this.m_array[--this.m_length];
    }

    unshift(...args: number[]): number
    {
        assertNotFixedVectorError(this.m_fixed);
        args = args instanceof Array ? args : [];
        args = args.map(v => Number(v));
        if (args.length == 0)
        {
            return this.m_length;
        }
        const k = this.m_array;
        const kmlen = this.m_length;
        this.m_length += args.length;
        let newCapacity = k.length;
        newCapacity = newCapacity < this.m_length ? this.m_length : newCapacity;
        this.m_array = new Float64Array(newCapacity);
        this.m_array.set(new Float64Array(args), 0);
        this.m_array.set(k.subarray(0, kmlen), args.length);
        return this.m_length;
    }

    removeAt(index: number): number
    {
        assertNotFixedVectorError(this.m_fixed);
        index = Math.max(0, index >>> 0);
        if (index >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        const r = this.m_array[index];
        const k = this.m_array;
        this.m_length--;
        this.m_array = new Float64Array(k.length);
        this.m_array.set(k.subarray(0, index));
        this.m_array.set(k.subarray(index + 1, this.m_length + 1), index);
        return r;
    }
    
    splice(startIndex: number, deleteCount: number = 0xFFFFFFFF, ...items: number[]): FlexDoubleVector
    {
        assertNotFixedVectorError(this.m_fixed);

        startIndex = Math.max(0, startIndex >>> 0);
        deleteCount = Math.max(0, deleteCount >>> 0);
        items = items instanceof Array ? items : [];
        items = items.map(v => Number(v));

        if (startIndex >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        if (startIndex + deleteCount > this.m_length)
        {
            deleteCount = this.m_length - startIndex;
        }

        const k = this.m_array;
        const kmlen = this.m_length;
        this.m_length = kmlen - deleteCount + items.length;
        let newCapacity = k.length;
        newCapacity = newCapacity < this.m_length ? this.m_length : newCapacity;
        this.m_array = new Float64Array(newCapacity);
        this.m_array.set(k.subarray(0, startIndex));
        this.m_array.set(k.subarray(startIndex + deleteCount, kmlen), startIndex);
        const r = k.slice(startIndex, startIndex + deleteCount);
        this.m_array.set(new Float64Array(items), kmlen - deleteCount);
        return new FlexDoubleVector(r);
    }

    slice(startIndex: number = 0, endIndex: number = 0x7FFFFFFF): FlexDoubleVector
    {
        fix-me;
    }
    
    sort(sortBehavior: any): FlexDoubleVector
    {
        fix-me;
    }

    indexOf(searchElement: number, fromIndex: number = 0): number
    {
        fix-me;
    }

    lastIndexOf(searchElement: number, fromIndex: number = 0): number
    {
        fix-me;
    }

    toString(): string
    {
        return this.m_array.toString();
    }

    toLocaleString(): string
    {
        return this.m_array.toLocaleString();
    }
}