// The seats a trainee can hold and the departments they can hold them in.
// Logic-free. From docs/ORG.md; fiction, no real person.
//
// The author, 2026-11-04: "when you start your shift game up, you 'log in' or
// 'create a profile' that determines your position, which departments are
// directly tied to you, and what your self-determined strengths and weaknesses
// are ... so a paint supervisor isn't forced to use the same screen as the
// welder lead or metal fab manager screen."
//
// `bay: true` marks a department whose floor, crew and scenarios are written.
// Only welding is, so far; docs/FRAME-departments.md is the plan for the rest.

export const SEATS = {
  lead: { label: 'Lead hand', about: 'You run the work on the floor without the authority to discipline or hire. The crew follows you because they trust you.',
    // focus areas this seat leans on, for the recommended path
    leans: ['D4', 'D1', 'F1', 'E1'] },
  supervisor: { label: 'Supervisor', about: 'You run a department: its people, its hours, its standard, and what it sends downstream.',
    leans: ['A1', 'D2', 'C1', 'B3'] },
  manager: { label: 'Operations manager', about: 'You run supervisors, not crews. Your job is the departments working as one line.',
    leans: ['A4', 'E2', 'B1', 'E1'] },
};

export const DEPARTMENTS = {
  fabrication: { name: 'Fabrication', group: 'metal', supervisor: 'Raymond Bergen', people: 8, makes: 'cut and formed parts',
    what: 'Cuts, bends and forms the steel. The first place a schedule slips.', stations: ['Saw and plasma', 'Press brake', 'Forming'],
    fedBy: [], feeds: ['machining', 'welding'] },
  machining: { name: 'Machining', group: 'metal', supervisor: 'Tony Sawatzky', people: 6, makes: 'machined parts',
    what: 'One CNC, one operator who really knows it. The plant\'s classic single point of failure.', stations: ['CNC', 'Manual mill and lathe', 'Deburr'],
    fedBy: ['fabrication'], feeds: ['welding', 'assembly'] },
  welding: { name: 'Welding', group: 'metal', supervisor: 'you, in the welding seat', people: 8, makes: 'welded bodies and frames',
    what: 'Bodies and frames. The bottleneck when fully staffed, worse when not.', stations: ['Fit-up', 'Body weld', 'Finish and inspect'],
    fedBy: ['fabrication', 'machining'], feeds: ['paint'], bay: true },
  paint: { name: 'Paint', group: 'metal', supervisor: 'Theresa Boucher', people: 6, makes: 'painted bodies',
    what: 'Booth time is fixed. Rework from welding shows up here first.', stations: ['Prep and mask', 'Booth', 'Cure and inspect'],
    fedBy: ['welding'], feeds: ['electrical'] },
  electrical: { name: 'Electrical', group: 'finishing', supervisor: 'Nikki Reimer', people: 7, makes: 'wired bodies',
    what: 'Harnesses and controllers. A fault found late here costs the most.', stations: ['Harness bench', 'Install', 'Test'],
    fedBy: ['paint'], feeds: ['interior'] },
  interior: { name: 'Interior', group: 'finishing', supervisor: 'Omar Haddad', people: 6, makes: 'trimmed bodies',
    what: 'Seats, panels, trim. Waits on everyone upstream.', stations: ['Trim', 'Seats', 'Panels'],
    fedBy: ['electrical'], feeds: ['assembly'] },
  assembly: { name: 'Assembly', group: 'finishing', supervisor: 'Curtis Bear', people: 10, makes: 'finished vehicles',
    what: 'Tires and glass bought in; the only place the whole vehicle exists.', stations: ['Chassis marriage', 'Final fit', 'Road test'],
    fedBy: ['machining', 'interior'], feeds: [] },
};

export const GROUPS = {
  metal: { name: 'Metal', manager: 'Dana Fiorino', about: 'The upstream half: fabrication, machining, welding, paint.' },
  finishing: { name: 'Finishing', manager: 'Hal Okafor', about: 'The downstream half: electrical, interior, assembly.' },
};

// The bay every module is written in until other departments are built.
export const WRITTEN_BAY = 'welding';
