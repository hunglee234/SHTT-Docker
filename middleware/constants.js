const ROLES = {
  SUPERADMIN: "SuperAdmin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  COLLABORATOR: "Collaborator",
  USER: "User",
};

const ADMIN_AND_TEAM = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.STAFF,
  ROLES.COLLABORATOR,
];
const ALL_ROLES = [...ADMIN_AND_TEAM, ROLES.USER];

module.exports = { ROLES, ADMIN_AND_TEAM, ALL_ROLES };
